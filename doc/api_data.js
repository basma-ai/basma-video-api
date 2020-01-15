define({ "api": [
  {
    "type": "post",
    "url": "/agent/answer_call",
    "title": "Answer a call",
    "name": "AgentAnswerCall",
    "group": "Agent",
    "description": "<p>Answer a call</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>The access token of the agent</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "call_id",
            "description": "<p>The ID of the call</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n {\n    \"success\": true,\n    \"data\": {\n    }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/agent.js",
    "groupTitle": "Agent"
  },
  {
    "type": "post",
    "url": "/agent/end_call",
    "title": "End a call",
    "name": "AgentEndCall",
    "group": "Agent",
    "description": "<p>End a call</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>The access token of the agent</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "call_id",
            "description": "<p>The ID of the call</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n {\n    \"success\": true,\n    \"data\": {\n    }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/agent.js",
    "groupTitle": "Agent"
  },
  {
    "type": "post",
    "url": "/agent/list_pending_calls",
    "title": "List pending calls",
    "name": "AgentListPendingCalls",
    "group": "Agent",
    "description": "<p>Get a list of the pending calls that the agent can answer</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "vu_token",
            "description": "<p>VU stands for &quot;vendor user&quot;, here put the vendor user's token, the one you got upon signin</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/agent.js",
    "groupTitle": "Agent"
  },
  {
    "type": "post",
    "url": "/agent/request_token",
    "title": "Request agent token (aka login)",
    "name": "AgentRequestToken",
    "group": "Agent",
    "description": "<p>Request a token for an agent, or in simple English, login</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vendor_id",
            "description": "<p>Vendor ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n {\n    \"success\": false,\n    \"data\": {\n        \"token\": \"80f3120cfcfa5cc3982a8e9af6a581a452c0ee59d4fdd6a3275a0ef46ab8533b\",\n        \"vu_user\": {\n            \"id\": 3,\n            \"username\": \"ali.bh\",\n            \"name\": \"Ali Alnoaimi\",\n            \"role\": null,\n            \"vendor\": {\n                \"id\": 1,\n                \"name\": \"International Bank of Basma\",\n                \"username\": \"ibb\"\n            }\n        }\n    }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/agent.js",
    "groupTitle": "Agent"
  },
  {
    "type": "post",
    "url": "/calls/end_call",
    "title": "End a call",
    "name": "CallsEnd",
    "group": "Calls",
    "description": "<p>End a call</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "guest_token",
            "description": "<p>The access token of the guest</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "call_id",
            "description": "<p>The ID of the call</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n {\n    \"success\": true,\n    \"data\": {\n    }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n {\n    \"success\": true,\n    \"data\": {\n        \"errors\": [\n            \"call_ended\"\n        ]\n    }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/calls.js",
    "groupTitle": "Calls"
  },
  {
    "type": "post",
    "url": "/calls/get_services",
    "title": "Get list of services of a vendor",
    "name": "CallsGetServices",
    "group": "Calls",
    "description": "<p>Get a list of services provided by a specific vendor</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "guest_token",
            "description": "<p>The access token of the guest</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "vendor_id",
            "description": "<p>The ID of the vendor to list their services</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/calls.js",
    "groupTitle": "Calls"
  },
  {
    "type": "post",
    "url": "/calls/refresh_call",
    "title": "Refresh a call",
    "name": "CallsRefresh",
    "group": "Calls",
    "description": "<p>Refresh a call, must be called repeatedly with less then 5 seconds interval to keep the call active and ringing</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "guest_token",
            "description": "<p>The access token of the guest</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "call_id",
            "description": "<p>The ID of the call</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n {\n    \"success\": true,\n    \"data\": {\n        \"call\": {\n            \"id\": 4,\n            \"guest_id\": 1,\n            \"vu_id\": null,\n            \"status\": \"calling\",\n            \"creation_time\": 1579097149332,\n            \"vendor_id\": 1,\n            \"vendor_service_id\": 2,\n            \"last_refresh_time\": 1579098055243,\n            \"connection_data\": null\n        }\n    }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/calls.js",
    "groupTitle": "Calls"
  },
  {
    "type": "post",
    "url": "/calls/start_call",
    "title": "Start a call",
    "name": "CallsStart",
    "group": "Calls",
    "description": "<p>Start call, must be started by a guest</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "guest_token",
            "description": "<p>The access token of the guest</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "service_id",
            "description": "<p>The ID of the service</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n {\n    \"success\": true,\n    \"data\": {\n        \"call_id\": 4\n    }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/calls.js",
    "groupTitle": "Calls"
  },
  {
    "type": "post",
    "url": "/guest/request_token",
    "title": "Request a guest token",
    "name": "GuestRequestToken",
    "group": "Guest",
    "description": "<p>Request an access token for a guest</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n {\n    \"success\": true,\n    \"data\": {\n        \"token\": \"cf6dc255705a657763b1ec632276e9ed5684511cc8089c2061bdd5a6f71776ce\"\n    }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/guest.js",
    "groupTitle": "Guest"
  },
  {
    "type": "post",
    "url": "/master/create_vendor_user",
    "title": "Create a vendor user",
    "name": "MasterCreateVendorUser",
    "group": "Master",
    "description": "<p>Create a user for a vendor (agent, manager et al.)</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "master_secret",
            "description": "<p>The secret, only you know it</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vendor_id",
            "description": "<p>The vendor's ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Full name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "role",
            "description": "<p>&quot;agent&quot; or &quot;admin&quot;</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>The username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>The password</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/master.js",
    "groupTitle": "Master"
  }
] });
