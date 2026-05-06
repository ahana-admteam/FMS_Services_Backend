[{
  "_id": {
    "$oid": "69b28bc36a170fd34659521e"
  },
  "fmsMasterId": 2,
  "fmsCreatedBy": {
    "userID": 1,
    "userEmail": "siddeshdr@ahanait.com",
    "userName": "siddesh"
  },
  "fmsName": "Ahana Library",
  "fmsDescription": "Ahana Library",
  "requestForm": "Ahana Library Request Form",
  "department": "Admin",
  "fmsAccess": [
    {
      "empId": "AS01989",
      "empName": "siddesh"
    },
    {
      "empId": "AS01990",
      "empName": "Veerana"
    },
    {
      "empId": "AS02556",
      "empName": "Salmansab I Gulgundi"
    }
  ],
  "requestFormAccess": [
    {
      "empId": "AS01989",
      "empName": "siddesh"
    },
    {
      "empId": "AS01990",
      "empName": "Veerana"
    },
    {
      "empId": "AS02824",
      "empName": "Swetha Shree H N"
    }
  ],
  "fmsQuestionare": [
    {
      "id": "41c75229-180c-42e7-9d05-49e82eb98bda",
      "question": "Requester Name",
      "required": true,
      "answerType": "TEXT",
      "allowedAnswers": [],
      "isStartDate": false
    },
    {
      "id": "b85fc783-9b42-443a-bdc9-f48ee363ae36",
      "question": "Requester Ahana Mail Id",
      "required": true,
      "answerType": "TEXT",
      "allowedAnswers": [],
      "isStartDate": false
    },
    {
      "id": "c928f167-6f2f-4c30-8a6c-e33a53fd0cfa",
      "question": "Requester Employee Id",
      "required": true,
      "answerType": "TEXT",
      "allowedAnswers": [],
      "isStartDate": false
    },
    {
      "id": "f22805bf-af3c-4d93-b225-eb126ee52442",
      "question": "Requester Contact No",
      "required": true,
      "answerType": "NUMBER",
      "allowedAnswers": [],
      "isStartDate": false
    },
    {
      "id": "4ba18494-b72a-4f42-85ef-ff36b509e7a5",
      "question": "Team",
      "required": false,
      "answerType": "TEXT",
      "allowedAnswers": [],
      "isStartDate": false
    },
    {
      "id": "972c937b-1f06-4e58-a2ee-c41c0dd71bb3",
      "question": "Book list (1st Preference)",
      "required": false,
      "answerType": "TEXT",
      "allowedAnswers": [],
      "isStartDate": false
    },
    {
      "id": "ccc9a901-561a-4adf-8dae-a65ba36f34ca",
      "question": "Book List (2nd Preference)",
      "required": false,
      "answerType": "TEXT",
      "allowedAnswers": [],
      "isStartDate": false
    }
  ],
 "Book Avaliblity": [
  {
    "id": 1,
    "BookName": "Atomic habits",
    "Count": 3
  },
  {
    "id": 2,
    "BookName": "The Psychology of Money",
    "Count": 5
  },
  {
    "id": 3,
    "BookName": "Rich Dad Poor Dad",
    "Count": 4
  },
  {
    "id": 4,
    "BookName": "Think and Grow Rich",
    "Count": 2
  },
  {
    "id": 5,
    "BookName": "Deep Work",
    "Count": 6
  },
  {
    "id": 6,
    "BookName": "Ikigai",
    "Count": 3
  },
  {
    "id": 7,
    "BookName": "The Alchemist",
    "Count": 7
  }
],
  "fmsWhats": [
    {
      "what": "Request for book",
      "id": 1
    },
    {
      "what": "Check the availability of the requested book & update the requestor",
      "id": 2
    },
    {
      "what": "Issue the book to the requestor and update the Book Register",
      "id": 3
    },
    {
      "what": "Receive acknowledgement from the requestor through email",
      "id": 4
    },
    {
      "what": "Send a reminder on Due/Return Date",
      "id": 5
    },
    {
      "what": "Collect back the book from requester and update the register",
      "id": 6
    },
    {
      "what": "Send mail/link for feedback/recommendations",
      "id": 7
    },
    {
      "what": "Requestor feedback submission",
      "id": 8
    }
  ],
  "fmsSteps": [
    {
      "step": 1,
      "who": [
        {
          "empId": "AS01989",
          "empName": "siddesh"
        },
        {
          "empId": "AS02299",
          "empName": "Veerana"
        },
        {
          "empId": "AS02288",
          "empName": "Bedasur Veeranna"
        },
        {
          "empId": "AS02556",
          "empName": "Salmansab I Gulgundi"
        },
        {
          "empId": "AS02556",
          "empName": "Salmansab I Gulgundi"
        }
      ],
      "what": {
        "what": "Request for book",
        "id": 1
      },
      "when": "",
      "how": {
        "type": "NONE",
        "description": "",
        "formStepsQustions": [],
        "miniStepsDetails": []
      },
      "plannedDate": {
        "type": "TAThrs",
        "duration": "2",
        "durationType": "hrs",
        "working": "INSIDE"
      },
      "startTimeType": "A2P"
    },
    {
      "step": 2,
      "who": [
        {
          "empId": "AS01989",
          "empName": "siddesh"
        },
        {
          "empId": "AS02299",
          "empName": "Veerana"
        },
        {
          "empId": "AS02556",
          "empName": "Salmansab I Gulgundi"
        }
      ],
      "status": [
        {
          "statusId": 1,
          "statusName": "Available"
        },
        {
          "statusId": 2,
          "statusName": "Not Available"
        }
      ],
      "what": {
        "what": "Check the availability of the requested book & update the requestor",
        "id": 2
      },
      "plannedDate": {
        "type": "TAThrs",
        "duration": "12",
        "durationType": "hrs",
        "working": "INSIDE"
      },
      "startTimeType": "A2P"
    },
    {
      "step": 3,
      "who": [
        {
          "empId": "AS01989",
          "empName": "siddesh"
        },
        {
          "empId": "AS02299",
          "empName": "Veerana"
        },
        {
          "empId": "AS02556",
          "empName": "Salmansab I Gulgundi"
        }
      ],
      "status": [
        {
          "statusId": 1,
          "statusName": "issued "
        },
        {
          "statusId": 2,
          "statusName": "Not issued"
        }
      ],
      "what": {
        "what": "Issue the book to the requestor and update the Book Register",
        "id": 3
      },
      "plannedDate": {
        "type": "TATdays",
        "duration": "1",
        "durationType": "days"
      },
      "how": {
        "type": "NONE",
        "description": "",
        "formStepsQustions": [],
        "miniStepsDetails": []
      },
      "startTimeType": "A2P"
    },
    {
      "step": 4,
      "who": [
        {
          "empId": "AS01989",
          "empName": "siddesh"
        },
        {
          "empId": "AS02288",
          "empName": "Veeranna"
        },
        {
          "empId": "AS02556",
          "empName": "Salmansab I Gulgundi"
        }
      ],
      "status": [
        {
          "statusId": 1,
          "statusName": "Received"
        }
      ],
      "what": {
        "what": "Receive acknowledgement from the requestor through email",
        "id": 4
      },
      "plannedDate": {
        "type": "TAThrs",
        "duration": "2",
        "durationType": "hrs",
        "working": "INSIDE"
      },
      "startTimeType": "A2P"
    },
    {
      "step": 5,
      "who": [
        {
          "empId": "AS01989",
          "empName": "siddesh"
        },
        {
          "empId": "AS02556",
          "empName": "Salmansab I Gulgundi"
        }
      ],
      "status": [
        {
          "statusId": 1,
          "statusName": "Sent"
        }
      ],
      "what": {
        "what": "Send a reminder on Due/Return Date",
        "id": 5
      },
      "plannedDate": {
        "type": "TATdays",
        "duration": "2",
        "durationType": "days"
      },
      "startTimeType": "A2P"
    },
    {
      "step": 6,
      "who": [
        {
          "empId": "AS01989",
          "empName": "siddesh"
        },
        {
          "empId": "AS02556",
          "empName": "Salmansab I Gulgundi"
        }
      ],
      "status": [
        {
          "statusId": 1,
          "statusName": "Done"
        }
      ],
      "what": {
        "what": "Collect back the book from requester and update the register",
        "id": 6
      },
      "plannedDate": {
        "type": "TAThrs",
        "duration": "2",
        "durationType": "hrs",
        "working": "INSIDE"
      },
      "startTimeType": "A2P"
    },
    {
      "step": 7,
      "who": [
        {
          "empId": "AS01989",
          "empName": "Siddesh D R"
        }
      ],
      "status": [
        {
          "statusId": 1,
          "statusName": "Sent"
        }
      ],
      "what": {
        "what": "Send mail/link for feedback/recommendations",
        "id": 7
      },
      "plannedDate": {
        "type": "TAThrs",
        "duration": "2",
        "durationType": "hrs",
        "working": "INSIDE"
      },
      "startTimeType": "A2P"
    },
    {
      "step": 8,
      "who": [
        {
          "empId": "AS01989",
          "empName": "Siddesh D R"
        }
      ],
      "status": [
        {
          "statusId": 1,
          "statusName": "Sent"
        }
      ],
      "what": {
        "what": "Requestor feedback submission",
        "id": 8
      },
      "requestorFeedback": [
        {
          "id": "ccc9a901-561a-4adf-8dae-a65ba36f34rf",
          "question": "Enter requestor feedback",
          "required": true,
          "answerType": "TEXT",
          "allowedAnswers": []
        }
      ],
      "plannedDate": {
        "type": "TAThrs",
        "duration": "2",
        "durationType": "hrs",
        "working": "INSIDE"
      },
      "startTimeType": "A2P"
    }
  ],
  "createdAt": {
    "$date": "2026-03-12T09:55:01.143Z"
  },
  "updatedAt": {
    "$date": "2026-03-12T09:55:01.143Z"
  }
}]