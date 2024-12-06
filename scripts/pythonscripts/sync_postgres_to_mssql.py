# copy_schema.py
import psycopg2
import pyodbc
import pandas as pd
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from typing import List
import time
import os
from dotenv import load_dotenv

load_dotenv()

def get_schema_tables():
    pg_conn = psycopg2.connect(
        host=os.getenv('PG_HOST'),
        database=os.getenv('PG_DATABASE'),
        user=os.getenv('PG_USER'),
        password=os.getenv('PG_PASSWORD'),
        port=os.getenv('PG_PORT', '5432')
    )
    # Get all tables from the schema
    cursor = pg_conn.cursor()
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'curated_kawasaki_registry'
        AND table_name NOT LIKE 'stg_%'
        AND table_name NOT LIKE 'int_%'
    """)
    tables = [table[0] for table in cursor.fetchall()]
    print(tables)
    pg_conn.close()
    return tables



def copy_table(table_name):
    try:
        start_time = time.time()
        pg_conn = psycopg2.connect(
            host=os.getenv('PG_HOST'),
            database=os.getenv('PG_DATABASE'),
            user=os.getenv('PG_USER'),
            password=os.getenv('PG_PASSWORD'),
            port=os.getenv('PG_PORT', '5432')
        )
        
        sql_conn = pyodbc.connect(
            'DRIVER={ODBC Driver 18 for SQL Server};'
            f'SERVER={os.getenv("SQL_HOST")};'
            f'DATABASE={os.getenv("SQL_DATABASE")};'
            f'UID={os.getenv("SQL_USER")};'
            f'PWD={os.getenv("SQL_PASSWORD")};'
            'TrustServerCertificate=yes;'
            'Packet Size=32768;'
            'MultipleActiveResultSets=True;'
            'Connection Timeout=300;'
        )
        # Check if table exists
        sql_cursor = sql_conn.cursor()
        sql_cursor.execute(f"IF OBJECT_ID('kawasaki.{table_name}', 'U') IS NOT NULL SELECT 1 ELSE SELECT 0")
        table_exists = sql_cursor.fetchone()[0]
        
        if table_exists:
            print(f"Table kawasaki.{table_name} already exists, skipping...")
            return
            
        print(f"Copying table: {table_name}")
        
        # Get table schema
        cursor = pg_conn.cursor()
        cursor.execute(f"""
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'curated_kawasaki_registry'
            AND table_name = '{table_name}'
            ORDER BY ordinal_position
        """)
        columns = cursor.fetchall()
        
        # Create schema if not exists
        sql_cursor.execute("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'kawasaki') EXEC('CREATE SCHEMA kawasaki')")
        sql_conn.commit()
        
        # Build CREATE TABLE statement
        create_table_sql = f"CREATE TABLE kawasaki.{table_name} ("
        column_names = []
        
        for i, (col_name, data_type, max_length) in enumerate(columns):
            column_names.append(col_name)
            if data_type == 'character varying':
                sql_type = f'VARCHAR({max_length if max_length else "MAX"})'
            elif data_type == 'integer':
                sql_type = 'INT'
            elif data_type == 'boolean':
                sql_type = 'BIT'
            elif data_type == 'timestamp without time zone':
                sql_type = 'DATETIME2'
            elif data_type == 'numeric':
                sql_type = 'DECIMAL(18,6)'
            elif data_type == 'text':
                sql_type = 'VARCHAR(MAX)'
            elif data_type == 'double precision':
                sql_type = 'FLOAT'
            elif data_type == 'date':
                sql_type = 'DATE'
            else:
                sql_type = 'VARCHAR(MAX)'
                
            create_table_sql += f"\n{col_name} {sql_type}"
            if i < len(columns) - 1:
                create_table_sql += ","
        
        create_table_sql += "\n)"
        
        # Create table
        sql_cursor.execute(create_table_sql)
        sql_conn.commit()

        # Get total row count from source
        cursor = pg_conn.cursor()
        cursor.execute(f"SELECT COUNT(*) FROM curated_kawasaki_registry.{table_name}")
        total_rows = cursor.fetchone()[0]
        print(f"Total rows to copy for {table_name}: {total_rows:,}")

        # Optimize chunk size based on total rows
        chunk_size = min(50000, max(10000, total_rows // 20))  # Dynamic chunk size
        rows_copied = 0
        columns_str = ','.join(column_names)
        params = ','.join(['?' for _ in column_names])
        insert_sql = f"INSERT INTO kawasaki.{table_name} ({columns_str}) VALUES ({params})"

        # Create a temporary table for batching
        temp_table_name = f"#temp_{table_name}"
        sql_cursor.execute(create_table_sql.replace(f"kawasaki.{table_name}", temp_table_name))
        sql_conn.commit()

        # Use pandas to read in chunks
        for chunk in pd.read_sql(
            f'SELECT * FROM curated_kawasaki_registry.{table_name}',
            pg_conn,
            chunksize=chunk_size
        ):
            chunk_start = time.time()
            
            # Handle datetime columns
            datetime_columns = [col[0] for col in columns if col[1] in ['timestamp without time zone', 'datetime2']]
            for col in datetime_columns:
                chunk[col] = pd.to_datetime(chunk[col], errors='coerce')
                chunk.loc[chunk[col] < '1753-01-01', col] = pd.NaT
                chunk.loc[chunk[col] > '9999-12-31', col] = pd.NaT
            
            # Replace NaN/inf values with None
            chunk = chunk.replace([np.inf, -np.inf], np.nan)
            chunk = chunk.where(pd.notnull(chunk), None)
            
            # Fast batch insert into temp table
            sql_cursor.fast_executemany = True
            sql_cursor.executemany(insert_sql.replace(f"kawasaki.{table_name}", temp_table_name), 
                                 chunk.values.tolist())
            sql_conn.commit()
            
            # Move data from temp to final table in smaller batches
            sql_cursor.execute(f"""
                INSERT INTO kawasaki.{table_name}
                SELECT TOP ({len(chunk)}) * FROM {temp_table_name};
                DELETE TOP ({len(chunk)}) FROM {temp_table_name};
            """)
            sql_conn.commit()
            
            rows_copied += len(chunk)
            chunk_time = time.time() - chunk_start
            rows_per_second = len(chunk) / chunk_time if chunk_time > 0 else 0
            
            print(f"Progress for {table_name}: {rows_copied:,}/{total_rows:,} rows "
                  f"({(rows_copied/total_rows*100):.1f}%) - "
                  f"Speed: {rows_per_second:.0f} rows/sec")

        # Drop temp table
        sql_cursor.execute(f"DROP TABLE {temp_table_name}")
        sql_conn.commit()

        end_time = time.time()
        total_time = end_time - start_time
        avg_speed = rows_copied / total_time if total_time > 0 else 0
        print(f"Completed copying {table_name}: {rows_copied:,} rows in {total_time:.2f} seconds "
              f"(avg {avg_speed:.0f} rows/sec)")
        
        # Verify row count
        sql_cursor.execute(f"SELECT COUNT(*) FROM kawasaki.{table_name}")
        final_count = sql_cursor.fetchone()[0]
        print(f"Final row count in destination table {table_name}: {final_count:,}")
        if final_count != total_rows:
            print(f"WARNING: Row count mismatch for {table_name}! Source: {total_rows:,}, Destination: {final_count:,}")

    except Exception as e:
        print(f"Error copying table {table_name}: {str(e)}")
        import traceback
        print(traceback.format_exc())
    finally:
        # Cleanup temp table if it exists
        try:
            sql_cursor.execute(f"IF OBJECT_ID('tempdb..{temp_table_name}') IS NOT NULL DROP TABLE {temp_table_name}")
            sql_conn.commit()
        except:
            pass
            
        if 'cursor' in locals():
            cursor.close()
        if 'sql_cursor' in locals():
            sql_cursor.close()
        if 'pg_conn' in locals():
            pg_conn.close()
        if 'sql_conn' in locals():
            sql_conn.close()

def main():
    tables = get_schema_tables()
    print(f"Found {len(tables)} tables to copy")
    
    # ThreadPoolExecutor to copy tables in parallel
    with ThreadPoolExecutor(max_workers=40) as executor:
        executor.map(copy_table, tables)
    
    print("Schema copy completed")

if __name__ == "__main__":
    main()