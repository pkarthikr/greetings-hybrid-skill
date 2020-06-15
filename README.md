
U : Alexa, open hello greetings. 
<If permissions are not granted, we ask for permissions>
A : Welcome to Hello Greetings, where you can listen to voice greetings from your friends. For this skill to work, I will need access to your email address and phone number. I've sent a card to your Alexa App. Please grant me permissions. 
U : <Grants permission to the skill. Webhook comes to your skill service. Generate a Unique Link for the User. Send that Unique Link to the User Email and Phone Number (SNS, Twilio)>

SMS : Hey, Here's the link for your Voice Greetings. https://example.com/unique-id
PIN = 3472

When you have a recording, just say Alexa, open Hello Greetings to listen to this. 

U : <Passes the link to their friends who open the website and record their audio.>
Send a notification to the Alexa Device - hey there's a new content available in your skill. Open it. 

U : Alexa, open hello greetings. 
A : You have a new greeting from your friend - <plays the recording>

Other things - 

Alexa, open hello greetings and send me the link again 
Alexa, open hello greetings and play all recordings 

// Structure 

The Link will have the user's ID in some format
https://example.com/user/xyz = where xyz = a unique code for this user (random number generator)

example.com/user/abc

1) Suggestion Generate = Long Alphanumeric IDs 
2) to have a PIN code as well - which the user enters on the web page. 