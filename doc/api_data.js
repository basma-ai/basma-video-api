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
    "url": "/agent/update_call",
    "title": "Update call info",
    "name": "AgentCallUpdate",
    "group": "Agent",
    "description": "<p>Update call's info</p>",
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
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "agent_notes",
            "description": "<p>Update the agent's notes</p>"
          },
          {
            "group": "Parameter",
            "type": "JSON",
            "optional": true,
            "field": "custom_fields_values",
            "description": "<p>Custom fields values</p>"
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
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "services_ids",
            "description": "<p>Array with list of the services, if empty will show all</p>"
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
    "url": "/agent/send_message",
    "title": "Send a message",
    "name": "AgentMessagesSend",
    "group": "Agent",
    "description": "<p>Send a message in a call</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "vu_token",
            "description": "<p>The access token of the VU (Vendor User)</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "call_id",
            "description": "<p>The ID of the call</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "message_type",
            "description": "<p>&quot;text&quot;, &quot;image&quot; or &quot;file&quot;</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "value",
            "description": "<p>the value of the message</p>"
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
    "url": "/agent/check_token",
    "title": "Check token",
    "name": "AgentTokenCheck",
    "group": "Agent",
    "description": "<p>Check the validity of the token</p>",
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
            "field": "access_token",
            "description": "<p>Access Token</p>"
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
    "url": "/calls/join",
    "title": "Join a call",
    "name": "CallsJoin",
    "group": "Calls",
    "description": "<p>Join a call given a call request token</p>",
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
            "field": "request_call_token",
            "description": "<p>The call token</p>"
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
    "url": "/calls/send_message",
    "title": "Send a message",
    "name": "CallsMessagesSend",
    "group": "Calls",
    "description": "<p>Send a message in a call</p>",
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
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "message_type",
            "description": "<p>&quot;text&quot;, &quot;image&quot; or &quot;file&quot;</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "value",
            "description": "<p>the value of the message</p>"
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
    "filename": "src/routes/calls.js",
    "groupTitle": "Calls"
  },
  {
    "type": "post",
    "url": "/calls/request_update",
    "title": "Refresh a call",
    "name": "CallsRequest",
    "group": "Calls",
    "description": "<p>Request a call update on the socket.io, must be called repeatedly with less then 5 seconds interval to keep the call active and ringing</p>",
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
          "content": "    HTTP/1.1 200 OK\n {\n    \"success\": true,\n    \"data\": {\n        \"call\": {\n            \"id\": 4,\n            \"guest_id\": 1,\n            \"vu_id\": null,\n            \"status\": \"calling\",\n            \"creation_time\": 1579097149332,\n            \"vendor_id\": 1,\n            \"vendor_service_id\": 2,\n            \"last_refresh_time\": 1579098055243,\n            \"connection_guest_token\": null\n        }\n    }\n}",
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
    "url": "/calls/submit_rating",
    "title": "Submit rating",
    "name": "CallsSubmitRating",
    "group": "Calls",
    "description": "<p>Submit a rating for a call</p>",
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
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "rating",
            "description": "<p>from 1 to 5, 5 being the best</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "feedback_text",
            "description": "<p>The feedback text</p>"
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
    "url": "/guest/get_vendor",
    "title": "Get vendor profile",
    "name": "GuestGetVendor",
    "group": "Guest",
    "description": "<p>Get a vendor's profile</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vendor_id",
            "description": "<p>The ID of the vendor</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vendor_username",
            "description": "<p>The Username of the vendor</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n {\n    \"success\": true,\n    \"data\": {\n        \"vendor\": {\n            \"id\": 1,\n            \"name\": \"International Bank of Basma\",\n            \"username\": \"ibb\",\n            \"logo_url\": \"https://i.imgur.com/o2H9D9f.png\"\n        }\n    }\n}",
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
    "url": "/guest/request_token",
    "title": "Request a guest token",
    "name": "GuestRequestToken",
    "group": "Guest",
    "description": "<p>Request an access token for a guest</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "name",
            "description": "<p>Name</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "phone",
            "description": "<p>Phone</p>"
          }
        ]
      }
    },
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
    "url": "/vendor/logs/list",
    "title": "List the log items",
    "name": "LogList",
    "group": "LogList",
    "description": "<p>List log items</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "access_token",
            "description": "<p>The access token.</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "vu_id",
            "description": "<p>The id of the vendor user which the log item belongs to.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "table_name",
            "description": "<p>The name of the table.</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": true,
            "field": "row_id",
            "description": "<p>The row id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "type",
            "description": "<p>The type: &quot;create&quot;, &quot;edit&quot; or &quot;delete&quot;</p>"
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
    "filename": "src/routes/vendor/vendor_logs.js",
    "groupTitle": "LogList"
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
  },
  {
    "type": "post",
    "url": "/onboarding/check_org_username",
    "title": "Check organization username",
    "name": "OnboardingCheckUsername",
    "group": "Onboarding",
    "description": "<p>Check kif organization username is available</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "org_username",
            "description": ""
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
    "filename": "src/routes/onboarding.js",
    "groupTitle": "Onboarding"
  },
  {
    "type": "post",
    "url": "/onboarding/join",
    "title": "Create a vendor",
    "name": "OnboardingJoin",
    "group": "Onboarding",
    "description": "<p>Join a vendor</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "org_name",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "org_username",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phone_number",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": ""
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
    "filename": "src/routes/onboarding.js",
    "groupTitle": "Onboarding"
  },
  {
    "type": "post",
    "url": "/onboarding/resend_otp",
    "title": "Resend OTP",
    "name": "OnboardingResendOTP",
    "group": "Onboarding",
    "description": "<p>Resend OTP (vendor)</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vendor_id",
            "description": ""
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
    "filename": "src/routes/onboarding.js",
    "groupTitle": "Onboarding"
  },
  {
    "type": "post",
    "url": "/onboarding/verify_otp",
    "title": "Verify OTP",
    "name": "OnboardingVerify",
    "group": "Onboarding",
    "description": "<p>Verify OTP (vendor)</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vendor_id",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "pin",
            "description": ""
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
    "filename": "src/routes/onboarding.js",
    "groupTitle": "Onboarding"
  },
  {
    "type": "post",
    "url": "/vendor/users/create",
    "title": "Create a user",
    "name": "VendorCreateUser",
    "group": "Vendor",
    "description": "<p>Create a user for a vendor (agent, manager et al.)</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>The vendor token</p>"
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
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "phone_status",
            "description": "<p>Phone status</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "groups_ids",
            "description": "<p>Group IDs</p>"
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
    "filename": "src/routes/vendor/vendor_users.js",
    "groupTitle": "Vendor"
  },
  {
    "type": "post",
    "url": "/vendor/users/list",
    "title": "List users",
    "name": "VendorListUsers",
    "group": "Vendor",
    "description": "<p>List the users of the logged in vendor</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>The vendor token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "per_page",
            "description": "<p>Per page</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page number</p>"
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
    "filename": "src/routes/vendor/vendor_users.js",
    "groupTitle": "Vendor"
  },
  {
    "type": "post",
    "url": "/vendor/billing/create_subscription",
    "title": "Create a subscription",
    "name": "VendorBillingCreateSubscription",
    "group": "vendor",
    "description": "<p>Create a subscription</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "package_id",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>&quot;monthly&quot; or &quot;annually&quot;</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "stripe_payment_method_id",
            "description": ""
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
    "filename": "src/routes/vendor/vendor_billing.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/billing/list_invoices",
    "title": "List invoices",
    "name": "VendorBillingInvoicesList",
    "group": "vendor",
    "description": "<p>Get billing overview</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
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
    "filename": "src/routes/vendor/vendor_billing.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/billing/overview",
    "title": "Get billing overview",
    "name": "VendorBillingOverview",
    "group": "vendor",
    "description": "<p>Get billing overview</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
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
    "filename": "src/routes/vendor/vendor_billing.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/billing/get_packages",
    "title": "Get packages",
    "name": "VendorBillingPackagesGet",
    "group": "vendor",
    "description": "<p>Get billing overview</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
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
    "filename": "src/routes/vendor/vendor_billing.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/billing/payment_method_add",
    "title": "Add a payment method",
    "name": "VendorBillingPaymentMethodAdd",
    "group": "vendor",
    "description": "<p>Add a payment method</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "stripe_payment_method_id",
            "description": "<p>Self explanatory</p>"
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
    "filename": "src/routes/vendor/vendor_billing.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/billing/payment_method_detach",
    "title": "Detach a payment method",
    "name": "VendorBillingPaymentMethodDetach",
    "group": "vendor",
    "description": "<p>Detach a payment method</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "stripe_payment_method_id",
            "description": ""
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
    "filename": "src/routes/vendor/vendor_billing.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/billing/payment_method_list",
    "title": "List payment methods",
    "name": "VendorBillingPaymentMethodList",
    "group": "vendor",
    "description": "<p>List payment methods</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
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
    "filename": "src/routes/vendor/vendor_billing.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/calls/get",
    "title": "Get a call",
    "name": "VendorCallsGet",
    "group": "vendor",
    "description": "<p>Get a call</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "call_id",
            "description": "<p>Call ID</p>"
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
    "filename": "src/routes/vendor/vendor_calls.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/calls/get",
    "title": "Get a call",
    "name": "VendorCallsGet",
    "group": "vendor",
    "description": "<p>Get a call</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "call_id",
            "description": "<p>Call ID</p>"
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
    "filename": "src/routes/vendor/vendor_calls_requests.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/calls/get_recording",
    "title": "Get a call's recording",
    "name": "VendorCallsGetRecording",
    "group": "vendor",
    "description": "<p>Get a call's recording</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "call_id",
            "description": "<p>Call ID</p>"
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
    "filename": "src/routes/vendor/vendor_calls.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/calls/list",
    "title": "Calls list",
    "name": "VendorCallsHistory",
    "group": "vendor",
    "description": "<p>Get the history of the calls</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page number</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "per_page",
            "description": "<p>Items per page</p>"
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
    "filename": "src/routes/vendor/vendor_calls.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/calls/list",
    "title": "Calls list",
    "name": "VendorCallsHistory",
    "group": "vendor",
    "description": "<p>Get the history of the calls</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page number</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "per_page",
            "description": "<p>Items per page</p>"
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
    "filename": "src/routes/vendor/vendor_calls_requests.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/calls/schedule",
    "title": "Schedule a Call",
    "name": "VendorCallsSchedule",
    "group": "vendor",
    "description": "<p>Schedule a call with a customer</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "service_id",
            "description": "<p>Service ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vu_id",
            "description": "<p>VU's ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phone_number",
            "description": "<p>Phone number</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "send_sms",
            "description": "<p>Send the user an SMS notification</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "scheduled_time",
            "description": "<p>The call's time, as a unix timestamp in ms (that's milliseconds)</p>"
          },
          {
            "group": "Parameter",
            "type": "JSON",
            "optional": false,
            "field": "custom_fields_value",
            "description": "<p>The custom fields and their values, as a json array</p>"
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
    "filename": "src/routes/vendor/vendor_calls.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/call_requests/create",
    "title": "Schedule a Call",
    "name": "VendorCallsSchedule",
    "group": "vendor",
    "description": "<p>Schedule a call with a customer</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "service_id",
            "description": "<p>Service ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vu_id",
            "description": "<p>VU's ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phone_number",
            "description": "<p>Phone number</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "send_sms",
            "description": "<p>Send the user an SMS notification</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "scheduled_time",
            "description": "<p>The call's time, as a unix timestamp in ms (that's milliseconds)</p>"
          },
          {
            "group": "Parameter",
            "type": "JSON",
            "optional": false,
            "field": "custom_fields_values",
            "description": "<p>The custom fields and their values, as a json array</p>"
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
    "filename": "src/routes/vendor/vendor_calls_requests.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/custom_fields/delete",
    "title": "Delete a custom field",
    "name": "VendorCustomFieldsDelete",
    "group": "vendor",
    "description": "<p>Delete a custom fields</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "custom_field_id",
            "description": "<p>Custom Field ID</p>"
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
    "filename": "src/routes/vendor/vendor_custom_fields.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/custom_fields/edit",
    "title": "Edit a custom fields",
    "name": "VendorCustomFieldsEdit",
    "group": "vendor",
    "description": "<p>Edit a custom field</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "custom_field_id",
            "description": "<p>ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>&quot;text&quot;, &quot;number&quot;, etc...</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Custom field name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "label",
            "description": "<p>Custom field label</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "is_mandatory",
            "description": "<p>Is mandatory?</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "is_visible_in_menus",
            "description": "<p>Is visible menus?</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "agent_only",
            "description": "<p>Agent only</p>"
          },
          {
            "group": "Parameter",
            "type": "Dynamic",
            "optional": false,
            "field": "value_description",
            "description": "<p>Value description</p>"
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
    "filename": "src/routes/vendor/vendor_custom_fields.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/custom_fields/get",
    "title": "Get a custom field",
    "name": "VendorCustomFieldsGet",
    "group": "vendor",
    "description": "<p>Get a custom field</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "custom_field_id",
            "description": "<p>ID, of the custom field</p>"
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
    "filename": "src/routes/vendor/vendor_custom_fields.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/custom_fields/list",
    "title": "List custom fields",
    "name": "VendorCustomFieldsList",
    "group": "vendor",
    "description": "<p>List custom fields</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
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
    "filename": "src/routes/vendor/vendor_custom_fields.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/dashboard_numbers",
    "title": "Get numbers for the dashboard",
    "name": "VendorDashboardNumbers",
    "group": "vendor",
    "description": "<p>Get the stat numbers for the homepage</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
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
    "filename": "src/routes/vendor/vendor.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/groups/create",
    "title": "Create a group",
    "name": "VendorGroupsCreate",
    "group": "vendor",
    "description": "<p>Create a group</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "name",
            "description": "<p>Group name</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "services_ids",
            "description": "<p>An array of the IDs of the services to attach to the group</p>"
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
    "filename": "src/routes/vendor/vendor_groups.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/roles/create",
    "title": "Create a role",
    "name": "VendorGroupsCreate",
    "group": "vendor",
    "description": "<p>Create a role</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "name",
            "description": "<p>Group name</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "permissions_ids",
            "description": "<p>An array of the IDs of the permissions to attach to the role</p>"
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
    "filename": "src/routes/vendor/vendor_roles.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/groups/delete",
    "title": "Delete a group",
    "name": "VendorGroupsDelete",
    "group": "vendor",
    "description": "<p>Delete a group</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "group_id",
            "description": "<p>Group ID</p>"
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
    "filename": "src/routes/vendor/vendor_groups.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/groups/edit",
    "title": "Edit a group",
    "name": "VendorGroupsEdit",
    "group": "vendor",
    "description": "<p>Edit a group</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "group_id",
            "description": "<p>Group ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Group name</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "services_ids",
            "description": "<p>An array of the IDs of the services to attach to the group</p>"
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
    "filename": "src/routes/vendor/vendor_groups.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/roles/edit",
    "title": "Edit a role",
    "name": "VendorGroupsEdit",
    "group": "vendor",
    "description": "<p>Edit a role</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "role_id",
            "description": "<p>Group ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Group name</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "permissions_ids",
            "description": "<p>An array of the IDs of the permissions to attach to the role</p>"
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
    "filename": "src/routes/vendor/vendor_roles.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/groups/get",
    "title": "Get a group",
    "name": "VendorGroupsGet",
    "group": "vendor",
    "description": "<p>Get a group</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "group_id",
            "description": "<p>Group ID</p>"
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
    "filename": "src/routes/vendor/vendor_groups.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/roles/get",
    "title": "Get a role",
    "name": "VendorGroupsGet",
    "group": "vendor",
    "description": "<p>Get a role</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "role_id",
            "description": "<p>Group ID</p>"
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
    "filename": "src/routes/vendor/vendor_roles.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/groups/list",
    "title": "List a group",
    "name": "VendorGroupsList",
    "group": "vendor",
    "description": "<p>List a group</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "per_page",
            "description": "<p>Records per page</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page</p>"
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
    "filename": "src/routes/vendor/vendor_groups.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/roles/list",
    "title": "List a role",
    "name": "VendorGroupsList",
    "group": "vendor",
    "description": "<p>List a role</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "per_page",
            "description": "<p>Records per page</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page</p>"
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
    "filename": "src/routes/vendor/vendor_permissions.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/roles/list",
    "title": "List a role",
    "name": "VendorGroupsList",
    "group": "vendor",
    "description": "<p>List a role</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "per_page",
            "description": "<p>Records per page</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page</p>"
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
    "filename": "src/routes/vendor/vendor_roles.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/reports/calls",
    "title": "List a role",
    "name": "VendorReportsCalls",
    "group": "vendor",
    "description": "<p>List calls report</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "per_page",
            "description": "<p>Records per page</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "page",
            "description": "<p>Page</p>"
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
    "filename": "src/routes/vendor/vendor_reports.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/roles/delete",
    "title": "Delete a role",
    "name": "VendorRolesDelete",
    "group": "vendor",
    "description": "<p>Delete a role</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "role_id",
            "description": "<p>Role ID</p>"
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
    "filename": "src/routes/vendor/vendor_roles.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/services/create",
    "title": "Create a service",
    "name": "VendorServicesCreate",
    "group": "vendor",
    "description": "<p>Create a service</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Service name</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "is_restricted",
            "description": "<p>Is Restricted?</p>"
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
    "filename": "src/routes/vendor/vendor_services.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/services/delete",
    "title": "Delete a service",
    "name": "VendorServicesDelete",
    "group": "vendor",
    "description": "<p>Delete a service</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "service_id",
            "description": "<p>Service ID</p>"
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
    "filename": "src/routes/vendor/vendor_services.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/services/edit",
    "title": "Edit a service",
    "name": "VendorServicesEdit",
    "group": "vendor",
    "description": "<p>Edit a service</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "service_id",
            "description": "<p>Group ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Service name</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "is_restricted",
            "description": "<p>Is Restricted?</p>"
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
    "filename": "src/routes/vendor/vendor_services.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/services/get",
    "title": "Get a service",
    "name": "VendorServicesGet",
    "group": "vendor",
    "description": "<p>Get a service</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
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
    "filename": "src/routes/vendor/vendor_services.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/services/list",
    "title": "List services",
    "name": "VendorServicesList",
    "group": "vendor",
    "description": "<p>List services</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
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
    "filename": "src/routes/vendor/vendor_services.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/settings/edit",
    "title": "Edit vendor settings",
    "name": "VendorSettingsEdit",
    "group": "vendor",
    "description": "<p>Edit vendor's settings</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>Vendor Name</p>"
          },
          {
            "group": "Parameter",
            "type": "JSON",
            "optional": true,
            "field": "working_hours",
            "description": "<p>Working hours, as a json object, in the given template</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "recording_enabled",
            "description": "<p>Whether to enable or disable recordings</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "call_request_sms_template",
            "description": "<p>The template of the SMS message to send to the customer upon agent starting the call with them</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "is_customer_view_enabled",
            "description": "<p>Enable the customer view where the customers call (aka call centre)</p>"
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
    "filename": "src/routes/vendor/vendor_settings.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/settings/get",
    "title": "Get vendor's settings",
    "name": "VendorSettingsGet",
    "group": "vendor",
    "description": "<p>Get vendor's settings</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
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
    "filename": "src/routes/vendor/vendor_settings.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/users/edit",
    "title": "Edit a user",
    "name": "VendorUsersEdit",
    "group": "vendor",
    "description": "<p>Edit a users</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vu_id",
            "description": "<p>Vendor User ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "role",
            "description": "<p>&quot;admin&quot; or &quot;agent&quot;</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "password",
            "description": "<p>new password, leave empty if you do not wish to change</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "phone_status",
            "description": "<p>&quot;online&quot; or &quot;offline&quot;</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "groups_ids",
            "description": "<p>Group IDs</p>"
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
    "filename": "src/routes/vendor/vendor_users.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/users/get",
    "title": "Get a user",
    "name": "VendorUsersGet",
    "group": "vendor",
    "description": "<p>Get a user</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vu_id",
            "description": "<p>Vendor User ID</p>"
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
    "filename": "src/routes/vendor/vendor_users.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/call_requests/edit",
    "title": "Edit a call request",
    "name": "VendorsCallsRequestsEdit",
    "group": "vendor",
    "description": "<p>Edit a call request</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "call_request_id",
            "description": "<p>Call Request ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "service_id",
            "description": "<p>Service ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "vu_id",
            "description": "<p>VU's ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phone_number",
            "description": "<p>Phone number</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "send_sms",
            "description": "<p>Send the user an SMS notification</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "scheduled_time",
            "description": "<p>The call's time, as a unix timestamp in ms (that's milliseconds)</p>"
          },
          {
            "group": "Parameter",
            "type": "JSON",
            "optional": false,
            "field": "custom_fields_value",
            "description": "<p>The custom fields and their values, as a json array</p>"
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
    "filename": "src/routes/vendor/vendor_calls_requests.js",
    "groupTitle": "vendor"
  },
  {
    "type": "post",
    "url": "/vendor/call_requests/join",
    "title": "Join a call (get call ID)",
    "name": "VendorsCallsRequestsJoin",
    "group": "vendor",
    "description": "<p>Get the ID of a call, or initiate it, also known as join</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "vu_token",
            "description": "<p>Vendor User Token</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "call_request_id",
            "description": "<p>Call Request ID</p>"
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
    "filename": "src/routes/vendor/vendor_calls_requests.js",
    "groupTitle": "vendor"
  }
] });
