import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/GetLoginCookie")
public class GetLoginCookie extends HttpServlet{

	private static final long serialVersionUID = 1L;
	
	
	protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("getlogincookies");
		Cookie[] cookies = request.getCookies();
		Cookie cookie = null;
		
		PrintWriter out = response.getWriter();
		response.setContentType("text/html");
		
  	  	boolean found = false;
  	  	String value = "";
  	  
  	  	if( cookies != null ) {
	  	  	for (int i = 0; i < cookies.length; i++) {
	  	  		cookie = cookies[i];
	  	  		if(cookie.getName().equals("userid")) {
	  	  			found = true;
	  	  			value = cookie.getValue();
	  	  		}
	  	  	}
  	  	} 

      	if(!found) {
      		out.print("none");
      		System.out.println("no cookies found");
  		} else {
  			try {
	  			Query q = new Query();
	  			User u = q.searchUser(Integer.parseInt(value));
	  			System.out.println("Cookie found for: " + u.username);
	  			out.print(u.username);
	  			q.close();
  			} catch (SQLException sqle) {
  				System.out.println("sqle: " + sqle);
  			} catch (ClassNotFoundException cnfe) {
  				System.out.println("cnfe: " + cnfe);
  			}
		}
      	out.flush();
      	out.close();
	}
}