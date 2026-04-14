[{
    "_id": {
        "$oid": "69b28dbd6a170fd346595220"
    },
    "fmsTaskId": 1,
    "fmsQAId": 1,
    "fmsMasterId": 2,
    "fmsName": "Ahana Library",
    "who": {
        "department": [
            {
                "deptId": 2,
                "deptName": "HR",
                "employees": [
                    { "empId": "AS01989", "empName": "siddesh" },
                    { "empId": "AS01990", "empName": "Veerana" }
                ]
            }
        ]
    },
    "fmsTaskDoer": {
        "empName": "siddesh",
        "empId": "AS01989"
    },
    "fmsTaskStatus": "COMPLETED",
    "fmsTaskCompletedStatus": "ONTIME",
    "plannedDate": {
        "type": "TAThrs",
        "duration": "2",
        "durationType": "hrs",
        "customTime": null,
        "working": "INSIDE",
        "endTime": null
    },
    "what": {
        "what": "Request for book",
        "id": 1
    },
    "how": {
        "type": "NONE",
        "description": "",
        "formStepsQustions": [],
        "miniStepsDetails": []
    },
    "next": [
        {
            "what": "Check the availability of  the requested book & update the requestor",
            "id": 2
        }
    ],
    "startTimeType": "A2P",
    "fmsTaskCreatedTime": "2026-03-12T15:26:13+05:30",
    "fmsTaskStartTime": "2026-03-12T15:26:13+05:30",
    "fmsTaskPlannedCompletionTime": "2026-03-12T17:26:13+05:30",
    "formStepsAnswers": null,
    "fmsTaskQualityDetails": null,
    "isTransferredFrom": false,
    "isTranferredTo": false,
    "transferredFromTaskId": null,
    "transferredToTaskId": null,
    "createdAt": { "$date": "2026-03-12T09:55:01.143Z" },
    "updatedAt": { "$date": "2026-03-12T09:55:01.143Z" }
}
]