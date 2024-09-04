<div>
<a href=""><img src="https://github.com/frozzel/frozzel/blob/63a9fc8f1afe7447e8074be5e67a79bfa6c3c591/Black%20Playful%20Animated%20Welcome%20Channel%20Youtube%20Intro%20Video.gif" align="center" height="" width="100%" ></a></div>

# Uni-Server (Universal Server)

## Overview

**Uni-Server** is a Node.js application that leverages OpenAI's ChatGPT and DALL-E 3 for content creation. The server can publish this content to various social media platforms (LinkedIn, Facebook, Instagram, and Twitter) and create blog posts for HubSpot using ChatGPT. It also utilizes the News API to generate posts with content curated by ChatGPT.

## Features

- Content creation using ChatGPT and DALL-E 3
- Publishing to LinkedIn, Facebook, Instagram, and Twitter
- Blog post creation for HubSpot
- Content generation using News API

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Running the Server](#running-the-server)
4. [API Setup](#api-setup)
   - [LinkedIn](#linkedin)
   - [Facebook](#facebook)
   - [Instagram](#instagram)
   - [Twitter](#twitter)
   - [HubSpot](#hubspot)
   - [News API](#news-api)
5. [Usage](#usage)
6. [Contributing](#contributing)
7. [License](#license)
8. [Token Refresh](#token-refresh)
    - [LinkedIn](#linkedin)
    - [META](#meta)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/Uni-Server.git
    ```
2. Navigate to the project directory:
    ```sh
    cd Uni-Server
    ```
3. Install dependencies:
    ```sh
    npm install
    ```

## Configuration

1. Create a `.env` file in the root directory and add your API keys and other configurations. Here's a template for the `.env` file:
    ```env
    MONGODB_URI=mongodb://127.0.0.1:27017/test
    OPENAI_API_KEY=
    PRIVATE_APP_ACCESS=
    LINKEDIN_CLIENT_ID=
    LINKEDIN_CLIENT_SECRET=
    LINKEDIN_TOKEN=
    LINKEDIN_ORG_ID=
    LINKEDIN_MEMBER_ID=
    TWITTER_API_KEY=
    TWITTER_API_SECRET=
    TWITTER_BEARER_TOKEN=
    TWITTER_API_SECRET_NON_CONSUMER=
    TWITTER_CLIENTID=
    TWITTER_CLIENT_SECRET=
    FACEBOOK_ACCESS_TOKEN=
    FB_PAGE_ID=
    FACEBOOK_ACCESS_TOKEN_CGI=
    FB_PAGE_ID_CGI=
    IG_ID=
    IG_ID_CGI=
    NEWS_API_KEY=
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    TWITTER_API_KEY_CGI=
    TWITTER_API_SECRET_CGI=
    TWITTER_BEARER_TOKEN_CGI=
    TWITTER_API_KEY_NON_CONSUMER_CGI=
    TWITTER_API_SECRET_NON_CONSUMER_CGI=
    TWITTER_CLIENTID_CGI=
    TWITTER_CLIENT_SECRET_CGI=
    ```

## Running the Server

Start the server with:
```sh
npm run dev
```

The server will be available at `http://localhost:8080`.

## API Setup

### LinkedIn

1. Go to the LinkedIn Developer portal and create a new application.
2. Set the redirect URI to `http://localhost:8080/auth/linkedin/callback`.
3. Note the Client ID and Client Secret and add them to your `.env` file.
4. Follow LinkedIn's OAuth 2.0 flow to get the access token.

> [!TIP] 
> [LinkedIn API Docs](https://learn.microsoft.com/en-us/linkedin/)

### Facebook

1. Go to the Facebook for Developers site and create a new app.
2. Set up Facebook Login and add the redirect URI as `http://localhost:3000/auth/facebook/callback`.
3. Note the App ID and App Secret and add them to your `.env` file.
4. Follow Facebook's OAuth 2.0 flow to get the access token.

> [!TIP] 
> [META API Docs](https://developers.facebook.com/docs/)

### Instagram

1. Go to the Facebook for Developers site and create a new app (if you don't have one from Facebook setup).
2. Set up Instagram Basic Display and add the redirect URI as `http://localhost:3000/auth/instagram/callback`.
3. Note the App ID and App Secret and add them to your `.env` file.
4. Follow Instagram's OAuth 2.0 flow to get the access token.

> [!TIP] 
> [META API Docs](https://developers.facebook.com/docs/)

### Twitter

1. Go to the Twitter Developer portal and create a new application.
2. Set the redirect URI to `http://localhost:3000/auth/twitter/callback`.
3. Note the API Key and API Secret Key and add them to your `.env` file.
4. Follow Twitter's OAuth 2.0 flow to get the access token.

> [!TIP] 
> [X API Docs](https://developer.x.com/en/products/x-api)

### HubSpot

1. Go to the HubSpot Developer portal and create a new app.
2. Note the API Key and add it to your `.env` file.

> [!TIP] 
> [HubSpot API Docs](https://developers.hubspot.com/docs/api/overview)

### News API

1. Go to the News API website and sign up for an API key.
2. Add the API key to your `.env` file.

> [!TIP] 
> [News API Docs](https://newsapi.org/)

## Usage

Once the server is running, it will automatically handle content creation and posting based on the configured APIs. Refer to the individual API documentation for specific usage and capabilities.

## Contributing

  Created by: [@frozzel](https://github.com/frozzel)
  
  Please contact me with questions at: [@frozzel](mailto:frozzel@me.com)

## License

  [![Github license](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


## TOKEN REFRESH 


### LINKEDIN

>[!NOTE]
> Helpful articles for basic concept under standings: 
>
>[Medium Article](https://medium.com/@evgeni.leonti/post-to-facebook-page-with-nodejs-379e885033de) 
>
>[DEV Article](https://dev.to/fardinabir/fetching-linkedin-user-data-and-sign-in-with-linkedin-using-openid-connect-3kf)

1. Copy link below into Browser (first add client id from app for developer or env file)

      https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=ADDYOURCLIENTIDHERE&redirect_uri=https%3A%2F%2Fwww.linkedin.com%2Fdevelopers%2Ftools%2Foauth%2Fredirect&scope=r_organization_social%20w_member_social%20w_organization_social%20openid%20profile%20r_ads_reporting%20rw_organization_admin%20r_ads%20rw_ads%20r_basicprofile%20r_organization_admin%20email%20r_1st_connections_size

      THE LINK WILL ASK FOR PERMISSION FROM YOUR LINKED IN ACCOUNT, SIGN IN AND HIT ALLOW, IT WILL REDIRECT YOU TO A BLANK PAGE
      YOU NEED THE CODE IN THE URL OF THIS BLANK PAGE FOR THE NEXT STEP 

      Example https://www.linkedin.com/developers/tools/oauth/redirect?code=YOU NEED THIS

2. Open POstMan, go to linked in collection, post to access token end point and add the Token to the Body code section

    THis will be the two month auth code needed to post.

### META

>[!NOTE] Helpful articles for basic concept under standings:
>[FACEBOOK API DOCS](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)
>
>[META API DOCS](https://developers.facebook.com/tools/explorer/?method=POST&path=me%3Ffields%3Did%2Cname&version=v19.0)

1. Go To graph API Explorer, Hit Generate Access Token to reauthorize user first, submit the GET request to verify its working. Save Token
Next Select Page Token and do the same as above now submit with the page token to verify page access. 

> [!CAUTION]
> THIS ONLY LAST AN HOUR 
    
    
    example:

    {
      "id": "RANDOIDNUMBER IS HERE",
      "name": "Cyrus Group Innovations"
    }

2. GET LONG LIVE TOken

    curl -i -X GET "https://graph.facebook.com/v19.0/oauth/access_token?  
        grant_type=fb_exchange_token&          
        client_id={app-id}&
        client_secret={app-secret}&
        fb_exchange_token={your-access-token}" 

    Get the api ID and app-secret in the app dashboard and the secret will be under App settings Basic.
    Take the above curl and add the three codes obtained to it in a text editor. copy the curl into your terminal to receive your long live token.

>[!WARNING]
> Expires 60 DAYS


---

By following these instructions, you'll be able to set up and run the Uni-Server to create and publish content across multiple platforms seamlessly. If you encounter any issues, please refer to the documentation or open an issue on GitHub.


### Notes 
Authorization: Bearer OPENAI_API_KEY

https://platform.openai.com/docs/api-reference/introduction

```sh
npm install openai@^4.0.0
```