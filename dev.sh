echo "Starting auto build!
DISClAIMER: this will only rebuild, not serve!"
dir=$(\ls -la)
while true; do
	if [[ $dir != $(\ls -la) ]]; then
		echo "Rebuilding!"
		${SHELL} ./build.sh
		echo "Done building!"
	fi
	dir=$(\ls -la)
	sleep 1
done
