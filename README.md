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

## FACEBOOK - INSTAGRAM INSTRUCTIONS

https://developers.facebook.com/docs/facebook-login/guides/access-tokens

https://developers.facebook.com/tools/explorer/?method=POST&path=me%3Ffields%3Did%2Cname&version=v19.0

Go To graph API Explorer, Hit Generate Access Token to reauthorize user first, submit the GET request to verify its working. Save Token
Next Select Page Token and do the same as above now submit with the page token to verify page access. 

###  **** THIS ONLY LAST AN HOUR *****
{
  "id": "RANDOIDNUMBER IS HERE",
  "name": "Cyrus Group Innovations"
}

### GET LONG LIVE TOken

curl -i -X GET "https://graph.facebook.com/v19.0/oauth/access_token?  
    grant_type=fb_exchange_token&          
    client_id={app-id}&
    client_secret={app-secret}&
    fb_exchange_token={your-access-token}" 

Get the api ID and app-secret in the app dashboard and the secret will be under App settings Basic.
Take the above curl and add the three codes obtained to it in a text editor. copy the curl into your terminal to receive your long live token.

### *** Expires 60 DAYS ***

## TWITTER/X INSTRUCTIONS

Create app in dev portal under new project. get keys created at creation or in "Keys and Tokens" tab. Generate new tokens and store all keys secrets and tokens in .env file. Go to the app Settings tab, generate a new OAuth 2.0 Client ID and Client Secret. Use the Post & Read option, then the Web option (not the native app). Set call back to http://127.0.0.1 and your site for the site. Regenerate Token And Secret, it should now say read and write in the token tab. Use the new tokens with the consumer ones to post on twitter, if managing multiple accounts run each config in isolation from each other not in a global state to avoid errors.

### Revision

Before generating Auth Tokens create permissions in settings tab, then generate token in Keys and Tokens tab, this will avoid auth errors

F@#$%&!@# Twitter 0Auth2 its trash dont even bother 
