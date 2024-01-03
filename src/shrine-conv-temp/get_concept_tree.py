import os
import requests
import json
import warnings

warnings.filterwarnings("ignore")
os.environ["PYTHONWARNINGS"] = "ignore:Unverified HTTPS request"
hub_base_uri = 'https://localhost:6443'


def get_children(path):
    children = []
    print(f'Getting children for {path}...')
    resp = requests.post(f'{hub_base_uri}/shrine-api/ontology/children', json={"path": path}, verify=False)
    if resp.text:
        direct_children = json.loads(resp.text)
        for child in direct_children:
            child['isRoot'] = False
            child['parentPath'] = path
            children.append(child)
            if child["conceptType"] in ["Container", "Folder"]:
                children += get_children(child["path"])
    return children


resp = requests.get(f'{hub_base_uri}/shrine-api/ontology/root', verify=False)
roots = json.loads(resp.text)

concepts = []
for root in roots:
    true_root = root["children"][0]
    true_root['isRoot'] = True
    true_root['parentPath'] = None
    concepts.append(true_root)
    children = get_children(root["children"][0]["path"])
    concepts += children
    
with open('./api_tests/ontology.json', 'w+', encoding='utf-8') as fout:
    fout.write(json.dumps(concepts, indent=4))



