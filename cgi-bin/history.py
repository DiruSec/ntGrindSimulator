#!/usr/bin/python3
# -*- coding: utf-8 -*-
import markdown
from os.path import dirname, abspath
import cgi

form = cgi.FieldStorage()
try:
    lang = form.getvalue('lang')
except:
    lang = 'ja'
try:
    file = open(dirname(dirname(abspath(__file__))) + "/history/history_" + lang + ".md","r+b")
except:
    file = open(dirname(dirname(abspath(__file__))) + "../history/history_ja.md","r+b")

data = file.read().decode("UTF-8")

html = markdown.markdown(data)

print ("Content-Type: text/html\n\n")
print ("<head><title>Update History</title></head>")
print (html)