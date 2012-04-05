test:
	@./node_modules/.bin/vows

doc:
	@./node_modules/.bin/groc .

githubdoc:
	@./node_modules/.bin/groc --github .

console:
	@node repl.js

.PHONY: console doc test githubdoc
