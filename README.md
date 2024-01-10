Oasis App Source Code    
Published Android App: https://play.google.com/store/apps/details?id=io.ionic.lighthouse   
Login Information to demo the app: Username: testUser, Password: userID   
Oasis App Support and Privacy Policy URL: https://afareenj.github.io/OasisAppPolicy   
Link to Oasis App Overview Presentation: https://github.com/afareenj/oasisapp/blob/main/Lighthouse%20Oasis%20App%20Presentation.pdf   
# OasisApp

## `Organization of Project in app folder:`
**dbLogin**: databaseLogin that uses a Http endpoint API to connect to the MySQL database.

**forgotid**: the forgotID page

**login**: the landing page after the login page where button to enter survey is accessible

**explore-container**: component example if there are no survey items

**home**: the login page

**tab1**: Previous Entries: view previous survey entries   

**tab2**: NARCAN finder lookup tool

**tab3**: COVID-19 test finder lookup tool

**tab4**: Settings: adjust notification settings

**tabs**: Modify the tab bar (tab1 - tab4) that appears at bottom of screen.   

**item**: contains code for survey questions import from database, display within app, and survey submission to database   

**useflowloc**: googlemaps navigation and survey   

In src/assets are pictures and json files for any offline activities.

## `Software`

1. App Software:
 - **Languages**: HTML, SCSS, TS
 - **Software**: Ionic, Angular, Node.js, MySQL for survey info

2. Website Software:
 - **Languages**: HTML, CSS, JS, SQL, PHP
 - **Software**: MySQL for survey info

3. Scraping Database to Excel:
 - **Languages**: Python, SQL

## `Folders`

**OasisAppAPI**: Please host this folder to submit app information to the database and change the endpoint to the hosted site in App > src > app > dbLogin > config.ts.

**Website**: The website is in the Website folder. Host this folder.

**DatabaseScrape**: To get information from the database, go to this folder. Must be connected to Hopkins VPN for this program to work. Do not host this folder.

**App**: This is the mobile application. Do not host this folder.

## `Setup Notes:`

[Node.js](https://nodejs.org/en/download), [XCode](https://developer.apple.com/xcode/), [MySQL](https://dev.mysql.com/downloads/), Android Studio

Please make sure you are signed into the VPN before logging into the MySQL database.

1. Run npm install -g cordova and follow steps from https://ionicframework.com/docs/intro/cli.

2. To view the app on your browser, run "ionic serve" or "ionic serve -l" in the App folder

3. To view mobile version, run "ionic cordova run ios" for ios version or "ionic cordova run android --device" for running on an android device. If you have an android emulator, just run without --device.

4. For android devices, to get the .apk file, you need [Java Version 8](https://java.com/en/download/), [Java SDK](https://www.oracle.com/java/technologies/downloads/#java8/), [Android Studio](https://developer.android.com/studio/index.html), and [Android SDK](https://developer.android.com/studio/intro/update.html). The SDK and Gradle should come with Android Studio. On a Mac, you would need to edit your .bash_profile (on a Mac can be found by "cd ~/.bash_profile" through a terminal) to correctly recognize where these items were stored. Example bash_profile:

    - #Add JAVA_Home to the global PATH variable
    - export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_271.jdk/Contents/Home
    - export PATH=${JAVA_HOME}/bin:$PATH
    - #Set Android_HOME
    - export ANDROID_HOME=~/Library/Android/sdk/
    - #Add the Android SDK to the ANDROID_HOME variable
    - export PATH=$ANDROID_HOME/platform-tools:$PATH
    - export PATH=$ANDROID_HOME/tools:$PATH
    - export GRADLE_HOME=/Library/gradle/gradle-6.7
    - export PATH=$PATH:$GRADLE_HOME/bin
    - yes | ~/Library/Android/sdk/tools/bin/sdkmanager --licenses

Install Gradle using Homebrew: First install homebrew by running: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Then, run brew install gradle in Terminal. 
If you have an error about unaccepted licenses:
cd ~/Library/Android/sdk/tools/bin
./sdkmanager --licenses
Enter y to accept all licenses.
cd ~/Library/Android/sdk/build-tools/31.0.0 \
  && mv d8 dx \
  && cd lib  \
  && mv d8.jar dx.jar
sudo cp /Library/Java/JavaVirtualMachines/jdk1.8.0_301.jdk/Contents/Home/lib/tools.jar /Library/Internet\ Plug-Ins/JavaAppletPlugin.plugin/Contents/Home/lib

To build android version, run sudo ionic cordova build android.

Right before running ionic cordova run android --device, run "source ~/.bash_profile"

## `Special Notes`
- To use a new googlemaps API key, please edit src > app > index.html.

- When recreating apps, go to the plugin folders for de.applant localNotifications (to take out anything IOS) and cordova localnotification (to take out anything android).

- Use Xcode (latest version) and adapter for IPhone app view - alternatively, use ionic cordova to run iOS simulator
- Test app with adapter on android - alternatively, create a virtual machine using Android Studio

## `Note`
To host all directories and files at once, use command 'chmod -R a+rX *' at root directory.
