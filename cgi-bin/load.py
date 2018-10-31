#!/usr/bin/python3
# -*- coding: utf-8 -*-
import sys
import json
import cgi
import hashlib
import pymysql
import configparser
from random import Random

resultJSON = {}
def sentJSON():
    print("Content-Type: application/json")
    print("\n")
    print("\n")
    print(json.dumps(resultJSON,indent=1))
def setJSON(status, message):
    resultJSON["status"] = status
    resultJSON["message"] = message
    
try:
    configFile = configparser.ConfigParser()
    configFile.read(sys.path[0] + "/config.ini")
    config = configFile["Connection"]
    db = pymysql.connect(host=config["Host"], user=config["User"], \
         passwd=config["Password"], db=config["Scheme"], port=int(config["Port"]), use_unicode=True, charset="utf8")
    cursor = db.cursor()
except:
    setJSON("error", "Error while connecting to database.")
    sentJSON()
    sys.exit(0)

form = cgi.FieldStorage()
readId = form.getvalue('data')
if len(readId) > 6:
    setJSON("error", "Invaild id.")
    sentJSON()
    sys.exit(0)

try:
    insertSql = '''SELECT content from simulator where key_id=%s'''
    cursor.execute(insertSql, readId)
    resultJSON["data"] = cursor.fetchall()[0]
    setJSON("success","Load data completed.")
except:
    setJSON("error","Error while loading data.")
        
sentJSON()

#Close database
cursor.close()
db.close()
