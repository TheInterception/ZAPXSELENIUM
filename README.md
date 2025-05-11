# ZAPXSELENIUM
Checkmarx ZAP JavaScript-based Selenium automation script to perform authenticated scans.

![image](https://github.com/user-attachments/assets/b69edbe9-0d91-4fdd-985d-a4dd557a52d1)


# ZAP Authenticated Scan Script for Testphp Vulnweb

This JavaScript automates the authentication process for the Testphp Vulnweb application within OWASP ZAP. It leverages Selenium WebDriver to interact with the web interface. The script initializes a Chrome browser instance, configured to proxy traffic through ZAP. It then navigates to the target login URL provided as a parameter. It locates the username and password input fields using their names ("uname" and "pass" respectively) and populates them with hardcoded credentials ("test" / "test"). After filling the credentials, the script identifies and clicks the login button using its XPath. It then waits for the login process to complete. Crucially, the script captures the session cookie named "login" from the browser after successful authentication. This session ID is essential for subsequent authenticated scanning. The script then interacts with ZAP's HTTP Sessions extension. It retrieves the HTTP Sessions Site for the target domain. If a session with the captured "login" cookie value exists, it's set as active. If no matching session is found, a new session is created with the "login" token and its value, added to the site, and then set as the active session. Finally, the script keeps the browser open for 30 seconds before closing it, allowing ZAP to utilize the authenticated session for further scanning.

How to use these scripts with CHECKMARX ZAP:

1.  Download the whole repository -> https://github.com/TheInterception/ZAPXSELENIUM.git 
2.  In ZAP, locate the + icon on the left side -> navigate to "Scripts" -> "Authentication".
3.  Right click on "Authentication" -> New Script.
4.  In the New Script dialog box mention the Script Name > "testphpvulnweb.js", Select type > Authentication, Script Engine > ECMAScript: Graal.js, Template > Select Any and click Save.
5.  Initiate an active scan against the Testphp Vulnweb application. ZAP will execute this authentication script first to establish an authenticated session before performing the scan.
6.  Execute the customized ZAP API postman collection using Postman or Newman (from CLI) to execute the whole script
