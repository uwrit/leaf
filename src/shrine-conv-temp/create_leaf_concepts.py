import os
import json
import re

with open(os.path.join('./api_tests', 'ontology.json'), 'r', encoding='utf-8') as fin:
    ontology = json.loads(fin.read())

concepts = []
for record in ontology:
    display   = record["displayName"]
    last_part = [x for x in record["path"].split('\\') if x][-1]
    category  = record["conceptCategory"]
    concept   = {
        "id": f"urn:leaf:concept:shrine:{record['path']}",
        "parentId": f"urn:leaf:concept:shrine:{record['parentPath']}" if record["parentPath"] != None else None,
        "isNumeric": '1' if record["isLab"] else '0',
        "isParent": '1' if record["conceptType"] != "Leaf" else '0',
        "isRoot": '1' if record["isRoot"] == True else '0',
        "uiDisplayName": display,
        "uiDisplayText": display,
        "sqlSetId": None,
        "sqlSetWhere": 'NULL',
        "sqlFieldNumeric": 'NULL'
    }
    if category == "Demographic":
        concept["sqlSetId"] = "@sqlset_person"
        if display == 'Female':
            concept["sqlSetWhere"] = "EXISTS (SELECT 1 FROM concept @C WHERE @C.concept_id = @.gender_concept_id AND @C.concept_name = 'FEMALE')"
        elif display == 'Male':
            concept["sqlSetWhere"] = "EXISTS (SELECT 1 FROM concept @C WHERE @C.concept_id = @.gender_concept_id AND @C.concept_name = 'MALE')"
        elif display.endswith("old"):
            age = display.replace('years old', '').replace('>=', '').strip()
            concept["sqlSetWhere"] = 'CONVERT(INT, (DATEDIFF(DAY, @.birth_datetime, GETDATE()) / 365.25)) ' + \
                (f'BETWEEN {age.replace("-", " AND ")}' if '-' in age else f'= {age}')
        elif 'Race' in display and display != 'Race':
            if 'Hispanic' in display:
                if 'Not' in display:
                    concept["sqlSetWhere"] = "EXISTS (SELECT 1 FROM concept @C WHERE @C.concept_id = @.ethnicity_concept_id AND @C.concept_name = 'Not Hispanic or Latino')"
                else:
                    concept["sqlSetWhere"] = "EXISTS (SELECT 1 FROM concept @C WHERE @C.concept_id = @.ethnicity_concept_id AND @C.concept_name = 'Hispanic or Latino')"
            else:
                concept["sqlSetWhere"] = f"EXISTS (SELECT 1 FROM concept @C WHERE @C.concept_id = @.race_concept_id AND @C.concept_name = '{last_part}')"
    elif category == "Diagnosis":
        concept["sqlSetId"] = "@sqlset_condition_occurrence"
        icd9 = re.search('\(([^;]*)\)', display)
        if icd9:
            icd9 = icd9.group(1)
            concept["sqlSetWhere"] = '@.condition_source_value ' + ("BETWEEN '" + icd9.replace("-", "' AND '") + "'" if '-' in icd9 else f"= '{icd9}'")
    elif category == "Lab":
        concept["sqlSetId"] = "@sqlset_measurement"
        concept["sqlFieldNumeric"] = "value_as_number"
        concept["sqlSetWhere"] = f"EXISTS (SELECT 1 FROM concept @C WHERE @C.concept_id = @.measurement_concept_id AND @C.concept_code = '{last_part}')"
    elif category == "Medication":
        concept["sqlSetId"] = "@sqlset_drug_exposure"
    
    concepts.append(concept)
    

def clean_for_sql(val):
    if val == 'NULL': 
        return val
    if val == None:
        return 'NULL'
    val = val.replace("'", "''")
    return "'" + val + "'"
    


with open(os.path.join('./api_tests', 'create_concepts.sql'), 'w+', encoding='utf-8') as fout:
    fout.write('''
DECLARE @user NVARCHAR(20) = 'leaf_scripts'               
INSERT INTO app.ConceptSqlSet (SqlSetFrom, IsEncounterBased, IsEventBased, SqlFieldDate, Created, CreatedBy, Updated, UpdatedBy)
SELECT *
FROM (VALUES ('dbo.person',               0, 0,  NULL,             GETDATE(), @user, GETDATE(), @user),                          
             ('dbo.condition_occurrence', 1, 0, '@.condition_start_date',	GETDATE(), @user, GETDATE(), @user),
             ('dbo.measurement',          1, 0, '@.measurement_date',	    GETDATE(), @user, GETDATE(), @user),
             ('dbo.drug_exposure',        1, 0, '@.drug_exposure_start_date',       GETDATE(), @user, GETDATE(), @user)
     ) AS X(col1,col2,col3,col4,col5,col6,col7,col8)
               
DECLARE @sqlset_person INT               = (SELECT TOP 1 Id FROM app.ConceptSqlSet WHERE SqlSetFrom = 'dbo.person')
DECLARE @sqlset_condition_occurrence INT = (SELECT TOP 1 Id FROM app.ConceptSqlSet WHERE SqlSetFrom = 'dbo.condition_occurrence')
DECLARE @sqlset_measurement INT          = (SELECT TOP 1 Id FROM app.ConceptSqlSet WHERE SqlSetFrom = 'dbo.measurement')
DECLARE @sqlset_drug_exposure INT        = (SELECT TOP 1 Id FROM app.ConceptSqlSet WHERE SqlSetFrom = 'dbo.drug_exposure')
''')
    for concept in concepts:
        fout.write(f"""INSERT INTO app.Concept (ExternalId, ExternalParentId, UniversalId, IsPatientCountAutoCalculated, IsNumeric,
                                              IsParent, IsRoot, SqlSetId, SqlSetWhere, SqlFieldNumeric, UiDisplayName, UiDisplayText,
                                              AddDateTime, ContentLastUpdateDateTime)
                     SELECT {clean_for_sql(concept['id'])}, {clean_for_sql(concept['parentId'])}, {clean_for_sql(concept['id'])}, 1, {concept['isNumeric']},
                            {concept['isParent']}, {concept['isRoot']}, {concept['sqlSetId']}, {clean_for_sql(concept['sqlSetWhere'])}, {clean_for_sql(concept["sqlFieldNumeric"])},
                            {clean_for_sql(concept['uiDisplayName'])}, {clean_for_sql(concept['uiDisplayText'])}, GETDATE(), GETDATE()\n""")
        
    fout.write("""
/**
 * Set ParentIds
 */
UPDATE app.Concept
SET ParentId = P.Id
FROM app.Concept AS C
     INNER JOIN (SELECT P.Id, P.ParentId, P.ExternalId
                 FROM app.Concept AS P) AS P ON C.ExternalParentID = P.ExternalID
WHERE C.ParentId IS NULL

/**
 * Set RootIds
 */
; WITH roots AS
(
    SELECT RootId           = C.Id
        , RootUiDisplayName = C.UiDisplayName
        , C.IsRoot
        , C.Id
        , C.ParentId
        , C.UiDisplayName
    FROM app.Concept AS C
    WHERE C.IsRoot = 1
    UNION ALL
    SELECT roots.RootId
        , roots.RootUiDisplayName
        , C2.IsRoot
        , C2.Id
        , C2.ParentId
        , C2.UiDisplayName
    FROM roots
         INNER JOIN app.Concept AS C2 ON C2.ParentId = roots.Id
)

UPDATE app.Concept
SET RootId = roots.RootId
FROM app.Concept AS C
     INNER JOIN roots ON C.Id = roots.Id
WHERE C.RootId IS NULL
""")