package Controller;

import java.io.IOException;
import java.io.PrintWriter;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/login")
public class Login_Handle extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
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