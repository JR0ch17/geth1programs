#! /usr/bin/env node
const axios = require('axios');

async function getHackerOnePrograms() {
  let programList = [];

  for (let cursor = 0; cursor <= 500; cursor += 25) {
    let response = await axios.request({
      url: `https://hackerone.com/graphql`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': process.env.HACKERONE_AUTH_TOKEN
      },
      data: {
        "operationName": "MyProgramsQuery",
        "variables": {
          "where": {
            "_and": [
              {
                "_or": [
                  {
                    "submission_state": {
                      "_eq": "open"
                    }
                  },
                  {
                    "submission_state": {
                      "_eq": "api_only"
                    }
                  },
                  {
                    "submission_state": {
                      "_is_null": true
                    }
                  }
                ]
              },
              {
                "_or": [
                  {
                    "_and": [
                      {
                        "_or": [
                          {
                            "bookmarked_team_users": {
                              "is_me": true
                            }
                          },
                          {
                            "whitelisted_hackers": {
                              "is_me": true
                            }
                          }
                        ]
                      },
                      {
                        "state": {
                          "_eq": "soft_launched"
                        }
                      }
                    ]
                  },
                  {
                    "_and": [
                      {
                        "_or": [
                          {
                            "bookmarked_team_users": {
                              "is_me": true
                            }
                          },
                          {
                            "reporters": {
                              "is_me": true
                            }
                          }
                        ]
                      },
                      {
                        "_or": [
                          {
                            "state": {
                              "_eq": "public_mode"
                            }
                          },
                          {
                            "external_program": {}
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          "count": 100,
          "orderBy": null,
          "secureOrderBy": {
            "started_accepting_at": {
              "_direction": "DESC"
            }
          },
          "cursor": `${Buffer.from(cursor.toString()).toString('base64')}`
        },
        "query": "query MyProgramsQuery($cursor: String, $count: Int, $where: FiltersTeamFilterInput, $orderBy: TeamOrderInput, $secureOrderBy: FiltersTeamFilterOrder) {\n  teams(first: $count, after: $cursor, order_by: $orderBy, secure_order_by: $secureOrderBy, where: $where) {\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    edges {\n      node {\n        name\n      }\n    }\n  }\n}\n"
      }
    });
    let edges = response.data.data.teams.edges;
    edges.map(program => {
      programList.push(program.node.name)
    })
  }

  programList = [...new Set(programList.sort())];
  programList.forEach(program => {
    console.log(program);
  });
};

const start = async function () {
  await getHackerOnePrograms();
}

if (validation()) {
  start();
}

function validation() {
  if (!process.env.HACKERONE_AUTH_TOKEN) {
    console.error("Missing HackerOne Auth Token");
    return false
  }
  return true
};