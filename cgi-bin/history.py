#!/usr/bin/python3
# -*- coding: utf-8 -*-
import markdown
from os.path import dirname, abspath
import cgi
import codecs, sys 
sys.stdout = codecs.getwriter('utf8')(sys.stdout.buffer)

form = cgi.FieldStorage()
try:
    lang = form.getvalue('lang')
except:
    lang = 'ja'
try:
    file = open(dirname(dirname(abspath(__file__))) + "/history/history_" + lang + ".md","rb")
except:
    file = open(dirname(dirname(abspath(__file__))) + "/history/history_ja.md","rb")

data = file.read().decode("UTF-8")

html = markdown.markdown(data)

print ("Content-Type: text/html; charset=utf-8\n\n")
print ("<head><title>Update History</title></head>")
print (html)