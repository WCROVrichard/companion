#!/bin/bash

#Check if mavproxy screen exists which implies that mavproxy screen log exists.
if screen -ls | grep -o "mavproxy" 1>/dev/null; then
	#get the version from mavproxy screen log file
	grep -o V[0-9].[0-9].[0-9] $HOME/companion/params/screenlog.0
fi

