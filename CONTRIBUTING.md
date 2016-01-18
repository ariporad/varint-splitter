# Contributing

Contributions are welcome!

Please try to maintain the existing coding style. Also, please make sure to add tests for anything you add or fix. You can run the tests and lint your code with:

```sh
npm run test
```

Please also make sure to keep code coverage reasonably high. You can run coverage with:

```sh
npm run test:cov

# You also can generate a full HTML report

npm run report && open ./coverage/lcov-report/index.html
```

And lastly, for development, you can auto-run tests when something changes with:

```sh
npm run watch
```
