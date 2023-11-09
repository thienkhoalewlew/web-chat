package Controller;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/login")
public class Handle_Login extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        boolean isValidLogin = isValidLogin(email, password);

        String loginResult = isValidLogin ? "Login successful" : "Invalid email or password";
        request.setAttribute("loginResult", loginResult);

        RequestDispatcher dispatcher = request.getRequestDispatcher("/path/to/login.html");
        dispatcher.forward(request, response);
    }

    private boolean isValidLogin(String email, String password) {
        return email.equals("example@example.com") && password.equals("password123");
    }
}