#!/bin/bash
jar=$(ls `pwd`/lib/*.jar)
set -ex
export CLASSPATH=`echo $jar | tr ' ' ':'`:$CLASSPATH
if [ -z "$(ls /input)" ]
then
	echo "The input directory is empty, no any video file is found!"
	exit 0
fi
args=(15 1.0 205 44 387 43 596 322 3 317 out.avi) #设置传递给EntryPoint.java的默认参数 compressedRate overlap points[4] videoName

count=0

# get args form stdin
while [ $# != 0 ]
do
	args[${count}]=$1
	count=$(( ++count ))
	shift
done

#get videoName for output
if [ ${#args[@]} = 11 ];
then
	videoName=${args[10]}
	unset args[10]
fi
javac EntryPoint.java && java EntryPoint ${args[*]}
ffmpeg -y -f image2  -i /output/%d.jpg -vcodec libx264 -crf 25  /output/$videoName
rm -rf /output/*.jpg

mp4FormatName=`echo $videoName | sed s/\.avi/\.mp4/`
ffmpeg -i /output/$videoName /output/$mp4FormatName
exec "$@"
