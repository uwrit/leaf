import os
import requests
import random
import json
import time
import warnings

warnings.filterwarnings("ignore")
os.environ["PYTHONWARNINGS"] = "ignore:Unverified HTTPS request"

node1_id       = 3698283121779390840
leaf_node_id   = 8304711555476111654
node1_name     = 'shrinenode1'
leaf_node_name = 'leaftest'
hub_base_uri   = 'https://localhost:6443'

query_id       = int(str(random.getrandbits(128))[:18])
node_id        = leaf_node_id #node1_id
node_name      = leaf_node_name #node1_name
researcher_id  = 24823904
create_date    = round(time.time() * 1000)

data = {
    "contentsType": "RunQueryAtHub",
    "contentsSubject": query_id,
    "contents": {
        "query": {
            "id": query_id,
            "versionInfo": {
                "protocolVersion": 2,
                "shrineVersion": "4.1.0-SNAPSHOT",
                "itemVersion": 2,
                "createDate": create_date,
                "changeDate": create_date
            },
            "status": {
                "encodedClass": "SentToHub"
            },
            "queryDefinition": {
                "expression": {
                    "nMustBeTrue": 1,
                    "compare": {
                        "encodedClass": "AtLeast"
                    },
                    "possibilities": [
                        {
                            "concepts": {
                                "nMustBeTrue": 1,
                                "compare": {
                                    "encodedClass": "AtLeast"
                                },
                                "possibilities": [
                                    {
                                        "displayName": "45-54 years old",
                                        "termPath": "\\\\SHRINE\\SHRINE\\Demographics\\Age\\45-54 years old\\",
                                        "constraint": None,
                                        "encodedClass": "Concept"
                                    }
                                ]
                            },
                            "startDate": None,
                            "endDate": None,
                            "occursAtLeast": 1,
                            "encodedClass": "ConceptGroup"
                        }
                    ],
                    "encodedClass": "Conjunction"
                }
            },
            "output": {
                "encodedClass": "Count"
            },
            "queryName": "Test from code",
            "nodeOfOriginId": node_id,
            "researcherId": researcher_id,
            "topicId": 1,
            "projectName": "Testing 2",
            "flagged": False,
            "flaggedMessage": None
        },
        "researcher": {
            "id": 0, #researcher_id,
            "versionInfo": {
                "protocolVersion": 2,
                "shrineVersion": "4.1.0-SNAPSHOT",
                "itemVersion": 1,
                "createDate": 0,
                "changeDate": 0
            },
            "userName": 'ndobb', #"demo",
            "userDomainName": 'u.washington.edu', # "i2b2demo",
            "nodeId": node_id
        },
        "topic": {
            "id": 1481654093,
            "versionInfo": {
                "protocolVersion": 2,
                "shrineVersion": "4.1.0-SNAPSHOT",
                "itemVersion": 1,
                "createDate": 0,
                "changeDate": 0
            },
            "researcherId": researcher_id,
            "name": "Testing",
            "description": "This is a topic for testing SHRINE 2020 (1)"
        },
        "protocolVersion": 2
    },
    "protocolVersion": 2
}
data['contents'] = json.dumps(data['contents'], separators=(',', ': ')).replace(': ',':')


query_request = requests.put(f'{hub_base_uri}/shrine-api/mom/sendMessage/hub', json=data, verify=False)
nodes = {}
print()

while 1 != 0:
    status = requests.get(f'{hub_base_uri}/shrine-api/mom/receiveMessage/{node_name}?timeOutSeconds=50', verify=False)
    if status.ok and status.text:
        delivery_attempt    = json.loads(status.text)
        update_query_at_qep = json.loads(delivery_attempt['contents'])
        query_status        = json.loads(update_query_at_qep['contents'])

        if update_query_at_qep['contentsType'] == 'RunQueryForResult':
            msg_query_id = query_status['query']['id']
        else:
            msg_query_id        = query_status['queryId']

        delivery_attempt_id = delivery_attempt['deliveryAttemptId']['underlying']
        acknowledged        = requests.put(f'{hub_base_uri}/shrine-api/mom/acknowledge/{delivery_attempt_id}', verify=False)
        
        print(f'{delivery_attempt_id} - {msg_query_id} - {update_query_at_qep["contentsType"]}')
        print(update_query_at_qep['contents'])
        print()

        if 'adapterNodeId' not in query_status:
            continue

        msg_type = query_status['encodedClass']
        node_id = query_status['adapterNodeId']

        if node_id not in nodes:
            node_info = requests.get(f'{hub_base_uri}/shrine-api/hub/node/{node_id}', verify=False)
            nodes[node_id] = { 'node': json.loads(node_info.text), 'complete': False }
        if msg_type == 'ResultProgress':
            nodes[node_id]['status'] = query_status['status']['encodedClass']
        elif msg_type == 'CrcResult':
            nodes[node_id]['complete'] = True
            nodes[node_id]['result'] = { 
                'count': query_status['count'], 
                'crcQueryInstanceId': query_status['crcQueryInstanceId'],
                'obfuscatingParameters': query_status['obfuscatingParameters'] 
            }

        #if all([node for _, node in nodes.items() if node['complete'] == True]):
        #    break

    else:
        break

total = 0
for _, node in nodes.items():
    if node['complete']:
        total += node['result']['count']
        print(f"{node['node']['name']}: {node['result']['count']}")
print(f'Total: {total}')

'''
delivery_attempt_id  query_id              contentsType
-------------------  -------------------   ----------------
5127093841472865589 - 100523611964537284 - UpdateQueryAtQep
{"queryId":100523611964537284,"queryStatus":{"encodedClass":"ReceivedAtHub"},"changeDate":1696525308901,"encodedClass":"UpdateQueryAtQepWithStatus"}

8714169745439229153 - 100523611964537284 - UpdateQueryAtQep
{"queryId":100523611964537284,"changeDate":1696525309001,"resultProgresses":[{"id":1784089895897391647,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":1,"createDate":1696525309001,"changeDate":1696525309001},"queryId":100523611964537284,"adapterNodeId":3854912477537176565,"adapterNodeName":"Local Node 2","status":{"encodedClass":"IdAssigned"},"statusMessage":null,"crcQueryInstanceId":null},{"id":1702258560717024998,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":1,"createDate":1696525309001,"changeDate":1696525309001},"queryId":100523611964537284,"adapterNodeId":8304711555476111654,"adapterNodeName":"Leaf Test","status":{"encodedClass":"IdAssigned"},"statusMessage":null,"crcQueryInstanceId":null},{"id":4279393489486628251,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":1,"createDate":1696525309001,"changeDate":1696525309001},"queryId":100523611964537284,"adapterNodeId":3698283121779390840,"adapterNodeName":"Local Node 1","status":{"encodedClass":"IdAssigned"},"statusMessage":null,"crcQueryInstanceId":null}],"encodedClass":"UpdateQueryReadyForAdapters"}

281767842998056701 - 100523611964537284 - RunQueryForResult
{"query":{"id":100523611964537284,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":4,"createDate":1696525308735,"changeDate":1696525309001},"status":{"encodedClass":"ReadyForAdapters"},"queryDefinition":{"expression":{"nMustBeTrue":1,"compare":{"encodedClass":"AtLeast"},"possibilities":[{"concepts":{"nMustBeTrue":1,"compare":{"encodedClass":"AtLeast"},"possibilities":[{"displayName":"45-54 years old","termPath":"\\\\SHRINE\\SHRINE\\Demographics\\Age\\45-54 years old\\","constraint":null,"encodedClass":"Concept"}]},"startDate":null,"endDate":null,"occursAtLeast":1,"encodedClass":"ConceptGroup"}],"encodedClass":"Conjunction"}},"output":{"encodedClass":"Count"},"queryName":"Test from code","nodeOfOriginId":8304711555476111654,"researcherId":24823904,"topicId":1,"projectName":"Testing 2","flagged":false,"flaggedMessage":null,"encodedClass":"QueryProgress"},"researcher":{"id":24823904,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":1,"createDate":0,"changeDate":0},"userName":"demo","userDomainName":"i2b2demo","nodeId":8304711555476111654},"node":{"id":8304711555476111654,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":1,"createDate":1691522665369,"changeDate":1691522665369},"name":"Leaf Test","key":"leaftest","userDomainName":"leaftest","momQueueName":"leaftest","adminEmail":"","sendQueries":true,"understandsProtocol":2,"momId":"leaftest"},"topic":{"id":1481654093,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":1,"createDate":0,"changeDate":0},"researcherId":24823904,"name":"Testing","description":"This is a topic for testing SHRINE 2020 (1)"},"resultProgress":{"id":1702258560717024998,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":2,"createDate":1696525309001,"changeDate":1696525309083},"queryId":100523611964537284,"adapterNodeId":8304711555476111654,"adapterNodeName":"Leaf Test","status":{"encodedClass":"SentToAdapter"},"statusMessage":null,"crcQueryInstanceId":null},"protocolVersion":2}

3826692987303208400 - 100523611964537284 - Result
{"id":1784089895897391647,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":2,"createDate":1696525309001,"changeDate":1696525309081},"queryId":100523611964537284,"adapterNodeId":3854912477537176565,"adapterNodeName":"Local Node 2","status":{"encodedClass":"SentToAdapter"},"statusMessage":null,"crcQueryInstanceId":null,"encodedClass":"ResultProgress"}

1789400259777802191 - 100523611964537284 - Result
{"id":1702258560717024998,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":2,"createDate":1696525309001,"changeDate":1696525309083},"queryId":100523611964537284,"adapterNodeId":8304711555476111654,"adapterNodeName":"Leaf Test","status":{"encodedClass":"SentToAdapter"},"statusMessage":null,"crcQueryInstanceId":null,"encodedClass":"ResultProgress"}

7775922862824602811 - 100523611964537284 - Result
{"id":4279393489486628251,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":2,"createDate":1696525309001,"changeDate":1696525309084},"queryId":100523611964537284,"adapterNodeId":3698283121779390840,"adapterNodeName":"Local Node 1","status":{"encodedClass":"SentToAdapter"},"statusMessage":null,"crcQueryInstanceId":null,"encodedClass":"ResultProgress"}

6627771438749993387 - 100523611964537284 - Result
{"id":4279393489486628251,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":2,"createDate":1696525309001,"changeDate":1696525309155},"queryId":100523611964537284,"adapterNodeId":3698283121779390840,"adapterNodeName":"Local Node 1","status":{"encodedClass":"ReceivedByAdapter"},"statusMessage":null,"crcQueryInstanceId":null,"encodedClass":"ResultProgress"}

4728163467598226460 - 100523611964537284 - UpdateQueryAtQep
{"queryId":100523611964537284,"queryStatus":{"encodedClass":"SentToAdapters"},"changeDate":1696525309299,"encodedClass":"UpdateQueryAtQepWithStatus"}

4244047169261764344 - 100523611964537284 - Result
{"id":1784089895897391647,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":3,"createDate":1696525309001,"changeDate":1696525309163},"queryId":100523611964537284,"adapterNodeId":3854912477537176565,"adapterNodeName":"Local Node 2","status":{"encodedClass":"ReceivedByAdapter"},"statusMessage":null,"crcQueryInstanceId":null,"encodedClass":"ResultProgress"}

3228446450385589517 - 100523611964537284 - Result
{"id":4279393489486628251,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":3,"createDate":1696525309001,"changeDate":1696525309415},"queryId":100523611964537284,"adapterNodeId":3698283121779390840,"adapterNodeName":"Local Node 1","status":{"encodedClass":"SubmittedToCRC"},"statusMessage":null,"crcQueryInstanceId":null,"encodedClass":"ResultProgress"}

4203268677852707696 - 100523611964537284 - Result
{"id":1784089895897391647,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":4,"createDate":1696525309001,"changeDate":1696525309473},"queryId":100523611964537284,"adapterNodeId":3854912477537176565,"adapterNodeName":"Local Node 2","status":{"encodedClass":"SubmittedToCRC"},"statusMessage":null,"crcQueryInstanceId":null,"encodedClass":"ResultProgress"}

6462503807587626080 - 100523611964537284 - Result
{"id":4279393489486628251,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":4,"createDate":1696525309001,"changeDate":1696525313734},"queryId":100523611964537284,"adapterNodeId":3698283121779390840,"adapterNodeName":"Local Node 1","status":{"encodedClass":"ResultFromCRC"},"statusMessage":"FINISHED","crcQueryInstanceId":2095,"count":40,"obfuscatingParameters":{"binSize":5,"stdDev":6.5,"noiseClamp":10,"lowLimit":10},"breakdowns":null,"encodedClass":"CrcResult"}

3639190312427515142 - 100523611964537284 - Result
{"id":1784089895897391647,"versionInfo":{"protocolVersion":2,"shrineVersion":"4.1.0-SNAPSHOT","itemVersion":5,"createDate":1696525309001,"changeDate":1696525314404},"queryId":100523611964537284,"adapterNodeId":3854912477537176565,"adapterNodeName":"Local Node 2","status":{"encodedClass":"ResultFromCRC"},"statusMessage":"FINISHED","crcQueryInstanceId":2065,"count":35,"obfuscatingParameters":{"binSize":5,"stdDev":6.5,"noiseClamp":10,"lowLimit":10},"breakdowns":null,"encodedClass":"CrcResult"}
'''