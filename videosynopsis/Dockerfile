FROM ubuntu:14.04

# Install ffmpeg & gstreamer-ffmpeg
RUN 	set -x \
	&& apt-get update -y && apt-get -y install apt-transport-https \
	&& echo "deb http://ppa.launchpad.net/mc3man/gstffmpeg-keep/ubuntu trusty main" > /etc/apt/sources.list.d/mc3man-gstffmpeg-keep-trusty.list \
	&& echo "deb http://ppa.launchpad.net/mc3man/trusty-media/ubuntu trusty main" > /etc/apt/sources.list.d/mc3man-trusty-media-trusty.list \
	&& apt-get update -y \
	&& apt-get --force-yes -y install ffmpeg gstreamer0.10-ffmpeg gstreamer0.10-plugins-good \
	&& apt-get -y autoremove && apt-get -y autoclean

# Install opencv
RUN 	set -x \
	&& apt-get -y --force-yes install libopencv-dev libopencv2.4-java libopencv2.4-jni \
	&& apt-get -y autoremove && apt-get -y autoclean

# Install java
ENV LANG C.UTF-8
RUN apt-get update && apt-get install -y --force-yes openjdk-7-jdk && rm -rf /var/lib/apt/list6s/*

# Add code
RUN mkdir -p /workdir /input /output /tmp/objects/input
WORKDIR /workdir
ADD lib lib
ADD EntryPoint.java .
COPY entrypoint.sh /usr/local/bin
RUN ln -s usr/local/bin/entrypoint.sh /entrypoint.sh # backwards compat
ENTRYPOINT ["entrypoint.sh"]
