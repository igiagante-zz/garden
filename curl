//GARDEN
curl -X POST -H 'Content-type:application/json' -d '{ "name" : "green" }' 'http://localhost:8080/api/garden'


// doses
curl -X POST -H 'Content-type:application/json' -d '{ 
"phdose" : 4, "ec": 1.2, "ph": 6.5,
"nutrients" : [ { "name": "delta", "quantity": 5 }, { "name": "blomm-c", "quantity": 5 } ] 
}' 'http://localhost:8080/api/doses'   553e41691b0905b609000003

curl -X POST -H 'Content-type:application/json' -d '{ 
"phdose" : 3, "ec": 1.2, "ph": 6.5,
"nutrients" : [ { "name": "delta", "quantity": 4 }, { "name": "blomm-c", "quantity": 4 } ] 
}' 'http://localhost:8080/api/doses'   553e417a1b0905b609000006

curl -X POST -H 'Content-type:application/json' -d '{ 
"phdose" : 2, "ec": 1.2, "ph": 6.5,
"nutrients" : [ { "name": "delta", "quantity": 3 }, { "name": "blomm-c", "quantity": 3 } ] 
}' 'http://localhost:8080/api/doses'   553e418f1b0905b609000009


//IRRIGATIONS
curl -X POST -H 'Content-type:application/json' -d '{ "quantity": 1, "doseId": "553e41691b0905b609000003",
"gardenId" : "553e41451b0905b609000002"}' 'http://localhost:8080/api/irrigation'

curl -X POST -H 'Content-type:application/json' -d '{ "quantity": 1, "doseId": "553e417a1b0905b609000006",
"gardenId" : "553e41451b0905b609000002"}' 'http://localhost:8080/api/irrigation'

curl -X POST -H 'Content-type:application/json' -d '{ "quantity": 1, "doseId": "553e418f1b0905b609000009",
"gardenId" : "553e41451b0905b609000002"}' 'http://localhost:8080/api/irrigation'