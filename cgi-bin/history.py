#!/usr/bin/python3
# -*- coding: utf-8 -*-
import markdown
import sys
import cgi

form = cgi.FieldStorage()
try:
    lang = form.getvalue('lang')
except:
    lang = 'ja-JP'
try:
    file = open(sys.path[0] + "/../history/history_" + lang + ".md","r+b")
except:
    file = open(sys.path[0] + "/../history/history_ja-JP.md","r+b")

data = file.read().decode("UTF-8")

html = markdown.markdown(data)

print ("Content-Type: text/html\n\n")
print ("<head><title>Update History</title></head>")
print (html)