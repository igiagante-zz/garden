
curl -X POST -H 'Content-type:application/json' -d '{ 
"phDosis" : 4, "ec": 1.2, "ph": 6.5,
"nutrients" : [ { "name": "delta", "quantity": 5 }, { "name": "blomm-c", "quantity": 5 } ] 
}' 'http://localhost:8080/api/dosis'   553ae53842d4b4000d000003

curl -X POST -H 'Content-type:application/json' -d '{ 
"phDosis" : 3, "ec": 1.2, "ph": 6.5,
"nutrients" : [ { "name": "delta", "quantity": 4 }, { "name": "blomm-c", "quantity": 4 } ] 
}' 'http://localhost:8080/api/dosis'   553ae56642d4b4000d000006

curl -X POST -H 'Content-type:application/json' -d '{ 
"phDosis" : 2, "ec": 1.2, "ph": 6.5,
"nutrients" : [ { "name": "delta", "quantity": 3 }, { "name": "blomm-c", "quantity": 3 } ] 
}' 'http://localhost:8080/api/dosis'   553ae5a342d4b4000d000009


curl -X POST -H 'Content-type:application/json' -d '{ "quantity": 1, "dosisId": "553ae53842d4b4000d000003",
"gardenId" : "553ae099fa6361eb0c000002"}' 'http://localhost:8080/api/irrigation'

curl -X PUT -H 'Content-type:application/json' -d '{ "quantity": 1, "dosisId": "553ae53842d4b4000d000003",
"gardenId" : "553ae099fa6361eb0c000002"}' 'http://localhost:8080/api/irrigation/553aea3cc07f9c830f000002'

curl -X POST -H 'Content-type:application/json' -d '{ "quantity": 1, "dosisId": "553ae56642d4b4000d000006",
"gardenId" : "553ae099fa6361eb0c000002"}' 'http://localhost:8080/api/irrigation'

curl -X POST -H 'Content-type:application/json' -d '{ "quantity": 1, "dosisId": "553ae5a342d4b4000d000009",
"gardenId" : "553ae099fa6361eb0c000002"}' 'http://localhost:8080/api/irrigation'