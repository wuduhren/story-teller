# Overview
Many screenwriters, story teller, game designers need to layout their thoughts and structure it to wonderful stories. Here comes story-teller, an open source story line editor.

* Drag and drop your story box
* Capable of handle complicated branch
* Online code editing to control your story

# Screen Shot
Story Line
<br/>
![](https://imgur.com/5vY3Dbw.png)
<br/>
![](https://imgur.com/vWGpm3h.png)
<br/>
<br/>
Story editor, capable of editting complicated structure
<br/>
![](https://imgur.com/xmD7l3z.png)
<br/>
<br/>
Embeded code in the data
<br/>
![](https://imgur.com/8n3fcn3.png)
<br/>
<br/>
Story list
<br/>
![](https://imgur.com/MZD3xTl.png)

# Install
1. Setup `init.php`.
2. Put the whole file on your `www/`.
3. Install the sql file to DB.
4. You are able to login by a set of default account and password.

	```
	#account, this account has a special permission, install.
	root
	#password
	account+12345
	```
	
# JS
1. Story Modal

	```
	story.js
	story.util.js
	story.noteset.js
	story.note.js
	story.option.js
	story.cmd.js
	```

2. Sidebar Controller - `story.sidebar.js`
3. Modal Controller - `	story.modal.js`
4. Canvas Controller (jsPlumb) - `story.jsp.js`


