
import java.awt.Point;
import java.util.ArrayList;
import videosummary.*;

import org.bytedeco.javacpp.opencv_core.CvPoint;
import org.bytedeco.javacpp.opencv_core.IplImage;

import static org.bytedeco.javacpp.opencv_highgui.*;

public class EntryPoint {
	public static String getenv(String key, String def) {
		String value = System.getenv(key);
		if (value == null)
			return def;
		return value;
	}
	public static void main(String[] args) {
		ArrayList<Point> list_point=new ArrayList<Point>();
		int compressedRate = 15; //默认压缩率15
		double overlap = 1.0; //默认碰撞比1.0

		compressedRate = Integer.parseInt(args[0]);
		overlap = Double.parseDouble(args[1]);

		int x1 = Integer.parseInt(args[2]);
		int y1 = Integer.parseInt(args[3]);

		int x2 = Integer.parseInt(args[4]);
		int y2 = Integer.parseInt(args[5]);

		int x3 = Integer.parseInt(args[6]);
		int y3 = Integer.parseInt(args[7]);

		int x4 = Integer.parseInt(args[8]);
		int y4 = Integer.parseInt(args[9]);

		Point p0=new Point(x1, y1);
		Point p1=new Point(x2, y2);
		Point p2=new Point(x3, y3);
		Point p3=new Point(x4, y4);
		list_point.add(p0);
		list_point.add(p1);
		list_point.add(p2);
		list_point.add(p3);
		Tracking tc = new Tracking("/tmp/objects/", "/input", list_point);
		tc.begin();
		//视频浓缩过程
		Concentrate con = new Concentrate(tc.getBG(),
		"/tmp/objects/input",
		"/output/",
		"12Ex.avi",
		"/usr/bin/ffmpeg",
		compressedRate,
		overlap);
		con.sethash(tc.getHash());
		con.start(tc.getBG());

	}
}
