var System = Java.type('java.lang.System');
var Thread = Java.type('java.lang.Thread');
var ArrayList = Java.type('java.util.ArrayList');
var ChromeDriver = Java.type('org.openqa.selenium.chrome.ChromeDriver');
var ChromeOptions = Java.type('org.openqa.selenium.chrome.ChromeOptions');
var ScriptVars = Java.type("org.zaproxy.zap.extension.script.ScriptVars");
var By = Java.type('org.openqa.selenium.By');
var HttpSender = Java.type('org.parosproxy.paros.network.HttpSender');
var URI = Java.type('org.apache.commons.httpclient.URI');
var HttpSession = Java.type('org.zaproxy.zap.extension.httpsessions.HttpSession');
var ExtensionHttpSessions = Java.type('org.zaproxy.zap.extension.httpsessions.ExtensionHttpSessions');
var Control = Java.type('org.parosproxy.paros.control.Control');
var HttpSessionsSite = Java.type('org.zaproxy.zap.extension.httpsessions.HttpSessionsSite');
var HttpSessionToken = Java.type('org.zaproxy.zap.extension.httpsessions.HttpSessionToken');
var Proxy = Java.type('org.openqa.selenium.Proxy');
var Cookie = Java.type('org.apache.commons.httpclient.Cookie');

user_headers = null;

// Hardcoded credentials
var HARDCODED_USERNAME = "test";
var HARDCODED_PASSWORD = "test";

// Reuse existing driver if present
var driver = null;

function createDriver() {
    if (driver != null) {
        return driver;
    }

    System.setProperty("webdriver.chrome.driver", "C:\\Users\\xtrem\\ZAP\\webdriver\\windows\\64\\chromedriver.exe");
    var options = new ChromeOptions();
    var proxy = new Proxy();
    proxy.setHttpProxy("localhost:8888")
         .setFtpProxy("localhost:8888")
         .setSslProxy("localhost:8888")
         .setNoProxy("");
    options.setCapability("proxy", proxy);
    options.addArguments("--ignore-certificate-errors");
    driver = new ChromeDriver(options);
    return driver;
}

function waitForElement(driver, by, value, timeout) {
    var endTime = new Date().getTime() + timeout * 1000;
    while (new Date().getTime() < endTime) {
        var elements = driver.findElements(by(value));
        if (elements.size() > 0) {
            return elements.get(0);
        }
        Thread.sleep(1000);
    }
    throw new Error("Element with " + by + "=" + value + " not found within " + timeout + " seconds");
}

function authenticate(helper, paramsValues, credentials) {
    if (helper == null) {
        throw new Error("ZAP helper is not initialized. helper is null.");
    }

    print("Authenticating via JavaScript script...");
    var driver = createDriver();

    try {
        driver.get(paramsValues.get("exampleTargetURL"));
        Thread.sleep(2000);

        var username = HARDCODED_USERNAME;
        var password = HARDCODED_PASSWORD;

        print("Retrieved Username: " + username);
        print("Retrieved Password: " + password);

        if (username == null || username.isEmpty()) {
            throw new Error("Username is null or empty");
        }
        if (password == null || password.isEmpty()) {
            throw new Error("Password is null or empty");
        }

        // Wait for and fill the username field
        var usernameField = waitForElement(driver, By.name, "uname", 20);
        usernameField.sendKeys(username);
        Thread.sleep(2000);

        // Wait for and fill the password field
        var passwordField = waitForElement(driver, By.name, "pass", 20);
        passwordField.sendKeys(password);
        Thread.sleep(2000);

        // Wait for and click the login button
        var loginButton = waitForElement(driver, By.xpath, "/html/body/div[1]/div[2]/div[1]/form/table/tbody/tr[3]/td/input", 20);
        loginButton.click();
        Thread.sleep(5000);
        print("Login button clicked");

        // Capture the session cookie
        var cookies = driver.manage().getCookies();
        var sessionId = null;
        for (var cookie of cookies) {
            if (cookie.getName().equals("login")) {
                sessionId = cookie.getValue();
                break;
            }
        }
        if (sessionId == null) {
            throw new Error("Session cookie 'login' not found");
        }
        print("Captured session ID: " + sessionId);

        // Set the session as active using ScriptVars and ExtensionHttpSessions
        var site = 'testphp.vulnweb.com:80';

        function handleHttpSession(site, sessionId) {
            var extHttpSessions = Control.getSingleton().getExtensionLoader().getExtension(ExtensionHttpSessions.class);
            
            if (extHttpSessions != null) {
                var httpSessionsSite = extHttpSessions.getHttpSessionsSite(site, true);
                var sessionFound = false;

                var sessions = httpSessionsSite.getHttpSessions();
                for (var session of sessions) {
                    if (session.getTokenValue("login") === sessionId) {
                        httpSessionsSite.setActiveSession(session);
                        sessionFound = true;
                        break;
                    }
                }

                if (!sessionFound) {
                    var token = new HttpSessionToken("login", sessionId);
                    var newSession = new HttpSession(String(HttpSessionsSite.getNextSessionId()), site, new ArrayList());
                    newSession.addToken(token);
                    httpSessionsSite.addHttpSession(newSession);
                    httpSessionsSite.setActiveSession(newSession);
                    print("New session added and set as active in HTTP Sessions extension for site: " + site);
                } else {
                    print("Session set as active in HTTP Sessions extension for site: " + site);
                }
            } else {
                print("HTTP Sessions extension is not available.");
            }
        }

        handleHttpSession(site, sessionId);
        print(site, sessionId);

    } catch (e) {
        print("Error during authentication: " + e);
        throw e;
    } finally {
        // Keep the driver alive
        Thread.sleep(30000);
        driver.quit();
    }
}

function getRequiredParamsNames() {
    return ["exampleTargetURL"];
}

function getOptionalParamsNames() {
    return [];
}

function getCredentialsParamsNames() {
    return ["username", "password"];
}