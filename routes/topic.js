const express = require('express');
const router = express.Router();
var fs = require('fs');
var template = require('../lib/template.js');

router.get('/create', (request, response) => {
	var title = 'WEB - create';
	var list = template.list(request.list);
	var html = template.html(
		title,
		list,
		`
	  <form action="/topic/create_process" method="post">
	  <p><input type="text" name="title" placeholder="title"></p>
	  <p>
		  <textarea name="description" placeholder="description"></textarea>
	  </p>
	  <p>
		  <input type="submit">
	  </p>
	  </form>`,
	  ''
	);
	response.send(html);
});

router.post('/create_process', (request, response) => {
	var post = request.body;
	var title = post.title;
	var description = post.description;
	fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
		response.redirect(`/topic/page/${title}`);
	});
});

router.get('/update/:pageID', (request, response) => {
	fs.readFile(`data/${request.params.pageID}`, 'utf8', (err, description) => {
		var title = request.params.pageID;
		var list = template.list(request.list);
		var html = template.html(
			title,
			list,
			`
		  <form action="/topic/update_process" method="post">
		  <input name="id" type="hidden" value=${title}>
		  <p><input type="text" name="title" placeholder="title" value=${title}></p>
		  <p>
			  <textarea name="description" placeholder="description">${description}</textarea>
		  </p>
		  <p>
			  <input type="submit">
		  </p>
		  </form>`,
		  ''
		);
		response.send(html);
	});
});

router.post('/update_process', (request, response) => {
	var post = request.body;
	var id = post.id;
	var title = post.title;
	var description = post.description;
	fs.rename(`data/${id}`, `data/${title}`, (err) => {
		fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
			response.redirect(`/topic/page/${title}`);
		});
	});
});

router.post('/delete_process', (request, response) => {
	var post = request.body;
	var id = post.id;
	fs.unlink(`data/${id}`, () => {
		response.redirect('/');
	});
});

router.get('/page/:pageID', (request, response, next) => {
	fs.readFile(`data/${request.params.pageID}`, 'utf8', function (err, description) {
		if(err) {
			next('err');
		}
		else {
			var title = request.params.pageID;
			var list = template.list(request.list);
			var html = template.html(title, list, `<h2>${title}</h2>${description}`, 
				`
				<a href="/topic/create">create</a> 
				<a href="/topic/update/${title}">update</a>
				<form action="/topic/delete_process" method="post">
					<input type="hidden" name="id" value="${title}" />
					<input type="submit" value="delete" />
				</form>
			`);
			response.send(html);
		}
		
	});	
});

module.exports = router;