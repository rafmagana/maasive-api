test:
	@./node_modules/.bin/vows

doc:
	@./node_modules/.bin/groc .

console:
	@node repl.js

.PHONY: console doc test
