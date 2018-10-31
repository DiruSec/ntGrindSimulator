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
def random_str(randomlength=6):
    string = ''
    chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789'
    length = len(chars) - 1
    random = Random()
    for i in range(randomlength):
        string+=chars[random.randint(0, length)]
    return string
    
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
# data['data'] = form.getlist("data")[0]
queue = str(form.getlist("queue")[0])
list = str(form.getlist("list")[0])
base = str(form.getlist("base")[0])
data = '{"queue": ' + queue + ', "list": ' + list + ', "base": ' + base + '}'
dataHash = hashlib.md5(str(data).encode("utf-8")).hexdigest()

searchHashSql = '''SELECT key_id from simulator where hash_id=%s'''
execresult = cursor.execute(searchHashSql, dataHash)
if execresult > 0:
    keyId = cursor.fetchall()[0][0]
    setJSON("success","Saving data completed.")
    resultJSON["dataid"] = keyId
else:
    keyId = random_str()
    try:
        insertSql = '''INSERT INTO simulator (key_id, hash_id, content) VALUES (%s,%s,%s)'''
        insertVari = (keyId, dataHash, str(data))
        cursor.execute(insertSql, insertVari)
        setJSON("success","Saving data completed.")
        resultJSON["dataid"] = keyId
    except:
        setJSON("error","Error while saving data.")
        
sentJSON()

#Close database
db.commit()
cursor.close()
db.close()
