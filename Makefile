build:
	docker build -t gyyzyp/videosynopsis ./videosynopsis/
run:
	docker run -it --rm --volumes-from inputdb --volumes-from outputdb --name videosynopsis gyyzyp/videosynopsis
in:
	docker run -it -v `pwd`/uploads:/input --name inputdb ubuntu
out:
	docker run -it -v /output:/output --name outputdb ubuntu
