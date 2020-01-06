const assert = require('chai').assert;
const fs = require('fs');
const glob = require('glob');
const jsontosass = require('../jsontosass.js');

function removeFiles () {
  glob('test/*.s[ac]ss', function (er, files) {
    files.forEach(function (file) {
      fs.unlinkSync(file);
    });
  });
}

describe('jsontosass', function () {
  describe('module', function () {
    it('is present', function () {
      assert.isDefined(jsontosass, 'jsontosass is defined');
    });
    it('is an object', function () {
      assert.isObject(jsontosass, 'jsontosass is an object');
    });
  });
  // describe('convertObject()', function () {
  //   beforeEach(function () {
  //     jsontosass.mergeOptions({
  //       prettify: false
  //     });
  //   });
  //   it('is present', function () {
  //     assert.isFunction(jsontosass.convertObject);
  //   });
  //   it('creates Sass variable named $key on root level', function () {
  //     assert.equal(jsontosass.convertObject({
  //       key: 'value'
  //     }), '$key:value;');
  //   });
  //   it('creates Sass variables named by JSON key for multiple entries', function () {
  //     assert.equal(jsontosass.convertObject({
  //       key: 'value',
  //       key2: 'otherValue'
  //     }), '$key:value;$key2:otherValue;');
  //   });
  //   it('creates Sass map for nested object', function () {
  //     assert.equal(jsontosass.convertObject({
  //       key: {
  //         key2: 'value'
  //       }
  //     }), '$key:(key2:value);');
  //   });
  //   it('creates Sass list for JSON array', function () {
  //     assert.equal(jsontosass.convertObject({
  //       key: [1, 2, 3]
  //     }), '$key:(1,2,3);');
  //   });
  // });
  describe('convertFile()', function () {
    after(function () {
      removeFiles();
    });
    it('is present', function () {
      assert.isFunction(jsontosass.convertFile);
    });
    it('should use defaultOptions when no options are given', function (done) {
      const testFile = 'test/basic.scss';
      jsontosass.convertFile('test/basic.json', testFile, function () {
        fs.readFile(testFile, 'utf8', function (err, sass) {
          if (err) throw err;
          assert.equal(sass, '$key: value;');
          done();
        });
      });
    });
    it('basic file conversion', function (done) {
      const testFile = 'test/basic.scss';
      jsontosass.convertFile('test/basic.json', testFile, { prettify: false }, function () {
        fs.readFile(testFile, 'utf8', function (err, sass) {
          if (err) throw err;
          assert.equal(sass, '$key:value;');
          done();
        });
      });
    });
    it('extended file conversion', function (done) {
      const testFile = 'test/extended.scss';
      jsontosass.convertFile('test/extended.json', testFile, { prettify: false }, function () {
        fs.readFile(testFile, 'utf8', function (err, sass) {
          if (err) throw err;
          assert.equal(sass, "$key:(inner-key:(1,2,3),some-object:(color-black:#000,font-family:'Helvetica, sans-serif'),.special:1);");
          done();
        });
      });
    });
  });
  describe('convertFileSync()', function () {
    after(function () {
      removeFiles();
    });
    it('is present', function () {
      assert.isFunction(jsontosass.convertFileSync);
    });
    it('basic file conversion', function () {
      jsontosass.convertFileSync('test/basic.json', 'test/basic.scss', { prettify: false });
      const sass = fs.readFileSync('test/basic.scss', 'utf8');
      assert.equal(sass, '$key:value;');
    });
    it('extended file conversion', function () {
      jsontosass.convertFileSync('test/extended.json', 'test/extended.scss', { prettify: false });
      const sass = fs.readFileSync('test/extended.scss', 'utf8');
      assert.equal(sass, "$key:(inner-key:(1,2,3),some-object:(color-black:#000,font-family:'Helvetica, sans-serif'),.special:1);");
    });
  });
  describe('convert()', function () {
    it('is present', function () {
      assert.isFunction(jsontosass.convert);
    });
    it('throws an error when invalid JSON is given', function () {
      assert.throws(function () {
        jsontosass.convert('');
      }, Error);
    });
    it('returns a string', function () {
      assert.typeOf(jsontosass.convert('{}'), 'string');
    });
    it('creates configured spaces before colon', function () {
      assert.equal(jsontosass.convert('{"key":"value"}', {
        prettify: true,
        spaceBeforeColon: 4
      }), '$key    : value;');
    });
    it('creates configured spaces after colon', function () {
      assert.equal(jsontosass.convert('{"key":"value"}', {
        prettify: true,
        spaceAfterColon: 4
      }), '$key:    value;');
    });
    it('returns Sass variables in own line when prettify is enabled', function () {
      assert.equal(jsontosass.convert('{"key":"value","key2":"otherValue"}', {
        prettify: true
      }), '$key: value;\n$key2: otherValue;');
    });
    it('return newLines for map variables', function () {
      assert.equal(jsontosass.convert('{"key":{"key2":"value"},"key2":"otherValue"}', {
        prettify: true
      }), '$key: (\n    key2: value\n);\n$key2: otherValue;');
    });
    it('respect default indent', function () {
      assert.equal(jsontosass.convert('{"key":{"key2":"value"}}', {
        prettify: true
      }), '$key: (\n    key2: value\n);');
    });
    it('respect indent with tabs', function () {
      const options = {
        indent: 'tabs',
        prettify: true
      };
      assert.equal(jsontosass.convert('{"key":{"key2":"value"}}', options), '$key: (\n\tkey2: value\n);');
      assert.equal(jsontosass.convert('{"key":{"key2":{"key3":"value"}}}', options), '$key: (\n\tkey2: (\n\t\tkey3: value\n\t)\n);');
    });
    it('generate dashed variables instead of maps', function () {
      const options = {
        indent: 'tabs',
        prettify: true,
        useMaps: false
      };
      assert.equal(jsontosass.convert('{"key":{"key2":"value"}}', options), '$key-key2: value;');
      assert.equal(jsontosass.convert('{"key":{"key2":{"key3":"value"}}}', options), '$key-key2-key3: value;');
      assert.equal(jsontosass.convert('{"key":{"key2":{"key3":[1,2,3]}}}', options), '$key-key2-key3: (1,2,3);');
    });
  });
  describe('options', function () {
    it('false syntax option should throw an error', function () {
      assert.throws(function () {
        jsontosass.convert('{"key":"value"}', {
          syntax: 'wrong-syntax'
        });
      }, Error);
    });
    it('right syntax option but with capital letters should not throw an error', function () {
      assert.doesNotThrow(function () {
        jsontosass.convert('{"key":"value"}', {
          syntax: 'SCSS'
        });
      }, Error);
    });
  });
  describe('Sass syntax', function () {
    it('no semicolon in output', function () {
      assert.isNull(jsontosass.convert('{"key":"value"}', {
        syntax: 'sass'
      }).match(/;/g));
    });
    it('setting prettify to false should prettify anyway', function () {
      assert.equal(jsontosass.convert('{"key":{"key2":"value"}}', {
        syntax: 'sass'
      }), '$key: (\n    key2: value\n)');
    });
    it('basic file conversion', function () {
      jsontosass.convertFile('test/basic.json', 'test/basic.sass', {
        syntax: 'sass'
      }, function () {
        const sass = fs.readFileSync('test/basic.sass');
        assert.equal(sass, '$key: value');
      });
    });
    it('extended file conversion', function () {
      jsontosass.convertFile('test/extended.json', 'test/extended.sass', {
        indent: 'tabs',
        syntax: 'sass'
      }, function () {
        const sass = fs.readFileSync('test/extended.sass');
        assert.equal(sass, "$key: (\n\tinner-key: (\n\t\t1,\n\t\t2,\n\t\t3\n\t),\n\tsome-object: (\n\t\tcolor-black: #000,\n\t\tfont-family: 'Helvetica, sans-serif'\n\t),\n\t.special:1\n)");
      });
    });
  });
});
