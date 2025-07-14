@@ .. @@
   Note: This assumes some users have been created through auth
 */
 
+-- Enable pgcrypto extension for password hashing
+CREATE EXTENSION IF NOT EXISTS pgcrypto;
+
 -- Insert dummy profiles (these would normally be created via auth signup)