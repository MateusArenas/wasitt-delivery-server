#!/bin/bash
echo "sleeping for 10 seconds"
sleep 10

echo mongo_setup.sh time now: `date +"%T" `
mongo --host mongo:27017 <<EOF
  var cfg = {
    "_id": "rs0",
    "version": 1,
    "writeConcernMajorityJournalDefault" : true,
    "members": [
      {
        "_id": 0,
        "host": "mongo:27017",
        "priority": 1,
      }
    ]
  };

  rs.initiate(cfg, { force: true });
  rs.reconfig(cfg, { force: true });
  rs.secondaryOk();
  db.getMongo().setReadPref('nearest');
  rs.status();
EOF