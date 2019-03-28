#!/usr/local/bin/python3
# Script to fully dump out LeafDB schema objects, initialization data, and executables.

import os
from argparse import ArgumentParser, Namespace
from subprocess import Popen, PIPE

LEAFDB_SA_PW = 'LEAFDB_SA_PW'
BUILD_FILE = 'BUILD_FILE'
DATA_FILE = 'DATA_FILE'
PER_FILE_DIR = 'PER_FILE_DIR'

sql_license = '''-- Copyright (c) 2019, UW Medicine Research IT
-- Developed by Nic Dobbins and Cliff Spital
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.
'''

tables = [r'app.Concept', r'auth.Constraint',
          r'app.PanelFilter', r'app.DemographicQuery',
          r'network.Identity', r'ref.Shape', r'app.DatasetQuery',
          r'app.ConceptSqlSet', r'app.SpecializationGroup', r'app.Specialization',
          r'rela.ConceptSpecializationGroup']


def report_error(err, m):
    msg = str(err, 'utf-8').strip() + '\n'
    if m:
        msg += ' ' + m
    return msg


def get_args() -> Namespace:
    parser = ArgumentParser(
        prog='leafdb.sh', description='This script automates capturing database changes in source control.')
    parser.add_argument('-d', '--include-data',
                        action='store_true', help='Also creates the data initialization script')
    return parser.parse_args()


def get_env():
    env = {}
    projectDir = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
    sa_pw = os.environ.get(LEAFDB_SA_PW)
    if not sa_pw:
        raise OSError(
            '{0} required environment variable is not set'.format(LEAFDB_SA_PW))
    env[BUILD_FILE] = os.path.join(projectDir, 'src/db/build/LeafDB.sql')
    env[DATA_FILE] = os.path.join(projectDir, 'src/db/build/LeafDB.Data.sql')
    env[PER_FILE_DIR] = os.path.join(projectDir, 'src/db/obj/')
    env[LEAFDB_SA_PW] = sa_pw
    return env


def create_schema(build_file: str, sa_pw: str):
    print('Creating schema file...')
    p = Popen([r'mssql-scripter', r'-S', r'localhost', r'-d', r'LeafDB',
               r'--target-server-version', r'2014', r'-f', build_file, r'-U', r'sa', r'-P', sa_pw])
    if p.wait() != 0:
        raise Exception(report_error(p.stdout.read(),
                                     'Error creating schema file...'))
    print('Licensing schema file...')
    apply_license_to_file(build_file)
    print('Created schema file...')


def create_data(data_file: str, sa_pw: str):
    print('Creating data file...')
    args = [r'mssql-scripter', r'-S', r'localhost', r'-d', r'LeafDB',
            r'--target-server-version', r'2014', r'-f', data_file, r'-U', r'sa', r'-P', sa_pw, r'--data-only', r'--include-objects']
    for t in tables:
        args.append(t)
    p = Popen(args)
    if p.wait() != 0:
        raise Exception(report_error(p.stdout.read(),
                                     'Error creating data file...'))
    print('Created data file...')


def apply_license_to_file(fqp):
    with open(fqp, 'r') as reader:
        contents = reader.read().lstrip()

    if sql_license in contents:
        return

    with open(fqp, 'w') as writer:
        writer.write(sql_license + contents)


def apply_license(dir):
    for fp in os.listdir(dir):
        fqp = os.path.join(dir, fp)
        apply_license_to_file(fqp)


def create_source(per_file_dir: str, sa_pw: str):
    print('Cleaning source directory...')
    for filepath in os.listdir(per_file_dir):
        os.remove(os.path.join(per_file_dir, filepath))
    print('Cleaned source directory...')
    print('Creating source files...')
    p = Popen([r'mssql-scripter', r'-S', r'localhost', r'-d', r'LeafDB', r'--target-server-version',
               r'2014', r'--file-per-object', r'-f', per_file_dir, r'-U', r'sa', r'-P', sa_pw])
    if p.wait() != 0:
        raise Exception(report_error(p.stdout.read(),
                                     'Error creating source files...'))
    print('Licensing source files...')
    apply_license(per_file_dir)
    print('Created source files...')


def main():
    args = get_args()
    env = get_env()
    print('Scripting out LeafDB...')
    create_schema(env[BUILD_FILE], env[LEAFDB_SA_PW])
    if args.include_data:
        create_data(env[DATA_FILE], env[LEAFDB_SA_PW])
    create_source(env[PER_FILE_DIR], env[LEAFDB_SA_PW])
    print('Complete...')


main()
