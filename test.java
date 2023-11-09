import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class test {

    static final String JDBC_URL = "jdbc:mysql:WIN-J95C2KKPR63/web_chat";
    static final String USER = "sa";
    static final String PASS = "123456789";

    public static void main(String[] args) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, USER, PASS)) {
            System.out.println("Success! Connected to the database.");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}