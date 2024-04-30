# uni-server
server for my personal projects and testing


https://platform.openai.com/docs/api-reference/introduction

npm install openai@^4.0.0


***
Authorization: Bearer OPENAI_API_KEY



https://medium.com/@evgeni.leonti/post-to-facebook-page-with-nodejs-379e885033de

## LINKEDIN AUTH TOKEN INSTRUCTIONS

https://dev.to/fardinabir/fetching-linkedin-user-data-and-sign-in-with-linkedin-using-openid-connect-3kf

### Copy link below into Browser (first add client id from app for developer or env file)

https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=GETCLIENTIDFROMENV&redirect_uri=https%3A%2F%2Fwww.linkedin.com%2Fdevelopers%2Ftools%2Foauth%2Fredirect&scope=r_organization_social%20w_member_social%20w_organization_social%20openid%20profile%20r_ads_reporting%20rw_organization_admin
%20r_ads%20rw_ads%20r_basicprofile%20r_organization_admin%20email%20r_1st_connections_size

THE LINK WILL ASK FOR PERMISSION FROM YOUR LINKED IN ACCOUNT, SIGN IN AND HIT ALLOW, IT WILL REDIRECT YOU TO A BLANK PAGE
YOU NEED THE CODE IN THE URL OF THIS BLANK PAGE FOR THE NEXT STEP 

Example https://www.linkedin.com/developers/tools/oauth/redirect?code=YOU NEED THIS

### Open POstMan, go to linked in collection, gettokken and add the Bearer Token to the Body code section

THis will be the two month auth code needed to post.