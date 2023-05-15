.PHONY: codegen-format update-version test ci-test
update-version:
	@echo "$(VERSION)" > VERSION
	@perl -pi -e 's|"version": "[.\-\d\w]+"|"version": "$(VERSION)"|' package.json
	@perl -pi -e "s|Lotr.PACKAGE_VERSION = '[.\-\d\w]+'|Lotr.PACKAGE_VERSION = '$(VERSION)'|" src/lotr.core.ts

codegen-format:
	yarn && yarn fix

ci-test:
	yarn && yarn test

test: ci-test
