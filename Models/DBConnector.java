package Models;

import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DBConnector {
    private static Connection connection;

    public static Connection getConnection() {
        if (connection != null) {
            return connection;
        } else {
            try {
                Properties properties = new Properties();
                properties.load(new FileInputStream("dbconfig.properties"));

                String jdbcUrl = properties.getProperty("jdbcUrl");
                String user = properties.getProperty("user");
                String password = properties.getProperty("password");

                connection = DriverManager.getConnection(jdbcUrl, user, password);
            } catch (IOException | SQLException e) {
                e.printStackTrace();
            }
            return connection;
        }
    }
}
