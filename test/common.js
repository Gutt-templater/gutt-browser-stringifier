/* globals describe, it, Promise */

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

var generateName = require('./helpers/generate-name')
var parse = require('./helpers/parse').parse
var parseAndWriteFile = require('./helpers/parse').parseAndWriteFile
var runTemplate = require('./helpers/parse').runTemplate

chai.use(chaiAsPromised)
chai.should()

describe ('Javascript stringifier', function () {
  it ('echo expression', function () {
    var params = {
      b: 1,
      c: {
        variable: {
          str: 3
        }
      },
      d: 'variable'
    }

    return parse('<component>{ b + c[d][\'str\'] * 2 }</component>', params).should.eventually.deep.equal([7])
  })

  it ('echo expression 2', function () {
    var params = {
      b: 1,
      c: {
        variable: {
          str: 3
        }
      },
      d: 'variable'
    }

    return parse('<component>{ b + c[d].str * 2 }</component>', params).should.eventually.deep.equal([7])
  })

  it ('foreach expression without index', function () {
    var template =
      '<component>' +
      '<for-each item={item} from={news}>' +
      '<h1>{ item.title }</h1>' +
      '</for-each>' +
      '</component>'
    var params = {
      news: [
        {
          title: 'News'
        },
        {
          title: 'Olds'
        }
      ]
    }
    var result = [
      {
        tag: 'h1',
        attrs: {},
        children: [
          'News'
        ]
      },
      {
        tag: 'h1',
        attrs: {},
        children: [
          'Olds'
        ]
      }
    ]

    return parse(template, params).should.eventually.deep.equal(result)
  })

  it ('foreach expression with index', function () {
    var params = {
      news: [
        {
          title: 'News'
        },
        {
          title: 'Olds'
        }
      ]
    }
    var template =
      '<component>' +
      '<for-each key={index} item={item} from={news}>' +
      '<h1 data-index={index}>{item[\'title\']}</h1>' +
      '</for-each>' +
      '</component>'
    var result = [
      {
        tag: 'h1',
        attrs: {
          'data-index': '0'
        },
        children: [
          'News'
        ]
      },
      {
        tag: 'h1',
        attrs: {
          'data-index': '1'
        },
        children: [
          'Olds'
        ]
      }
    ]

    return parse(template, params).should.eventually.deep.equal(result)
  })

  it ('foreach statement at attributes at single tag', function () {
    var template =
      '<component>' +
      '<input title="Hello">' +
      '<for-each item={item} from={[0..3]}>' +
      '<attribute name={"data-index" ++ item} value={item} />' +
      '</for-each>' +
      '</input>' +
      '</component>'
    var result = [
      {
        tag: 'input',
        attrs: {
          title: 'Hello',
          'data-index0': 0,
          'data-index1': 1,
          'data-index2': 2,
          'data-index3': 3
        },
        children: []
      }
    ]

    return parse(template).should.eventually.deep.equal(result)
  })

  it ('foreach statement at attributes at couple tag', function () {
    var template =
      '<component>' +
      '<div title="Hello">' +
      '<for-each item={item} from={[0..3]}>' +
      '<attribute name={"data-index" ++ item} value={item} />' +
      '</for-each>' +
      '</div>' +
      '</component>'
    var result = [
      {
        tag: 'div',
        attrs: {
          title: 'Hello',
          'data-index0': 0,
          'data-index1': 1,
          'data-index2': 2,
          'data-index3': 3
        },
        children: []
      }
    ]

    return parse(template, {item: 2}).should.eventually.deep.equal(result)
  })

  it ('switch statement for tags with default', function () {
    var template =
      '<component>' +
      '<switch>' +
      '<default>' +
      'default value' +
      '</default>' +
      '</switch>' +
      '</component>'

    return parse(template, {}).should.eventually.deep.equal(['default value'])
  })

  it ('switch statement for tags with positive case 1', function () {
    var template =
      '<component>' +
      '<switch>' +
      '<case test={a > b}>' +
      'case 1' +
      '</case>' +
      '</switch>' +
      '</component>'

    return parse(template, {a: 2, b: 1}).should.eventually.deep.equal(['case 1'])
  })

  it ('switch statement for tags with negative case 1', function () {
    var template =
      '<component>' +
      '<switch>' +
      '<case test={a > b}>' +
      'case 1' +
      '</case>' +
      '</switch>' +
      '</component>'

    return parse(template, {a: 1, b: 2}).should.eventually.deep.equal([])
  })

  it ('switch statement for tags with positive case 2', function () {
    var template =
      '<component>' +
      '<switch>' +
      '<case test={a > b}>' +
      'case 1' +
      '</case>' +
      '<case test={b > a}>' +
      'case 2' +
      '</case>' +
      '</switch>' +
      '</component>'

    return parse(template, {a: 1, b: 2}).should.eventually.deep.equal(['case 2'])
  })

  it ('switch statement for tags with positive default statement', function () {
    var template =
      '<component>' +
      '<switch>' +
      '<case test={a > b}>' +
      'case 1' +
      '</case>' +
      '<default>' +
      'default statement' +
      '</default>' +
      '</switch>' +
      '</component>'

    return parse(template, {a: 1, b: 2}).should.eventually.deep.equal(['default statement'])
  })

  it ('switch statement for attributes with default', function () {
    var template =
      '<component>' +
      '<div>' +
      '<switch>' +
      '<default>' +
      '<attribute name="data-id" value="qwerty" />' +
      '</default>' +
      '</switch>' +
      '</div>' +
      '</component>'
    var result = [
      {
        tag: 'div',
        attrs: {
          'data-id': 'qwerty'
        },
        children: []
      }
    ]

    return parse(template, {}).should.eventually.deep.equal(result)
  })

  it ('switch statement for attributes with positive case 1', function () {
    var template =
      '<component>' +
      '<div>' +
      '<switch>' +
      '<case test={a > b}>' +
      '<attribute name="case" value="1" />' +
      '</case>' +
      '</switch>' +
      '</div>' +
      '</component>'
    var result = [
      {
        tag: 'div',
        attrs: {
          case: '1'
        },
        children: []
      }
    ]

    return parse(template, {a: 2, b: 1}).should.eventually.deep.equal(result)
  })

  it ('switch statement for attributes with negative case 1', function () {
    var template =
      '<component>' +
      '<div>' +
      '<switch>' +
      '<case test={a > b}>' +
      '<attribute name="case" value="1" />' +
      '</case>' +
      '</switch>' +
      '</div>' +
      '</component>'
    var result = [
      {
        tag: 'div',
        attrs: {},
        children: []
      }
    ]

    return parse(template, {a: 1, b: 2}).should.eventually.deep.equal(result)
  })

  it ('switch statement for attributes with positive case 2', function () {
    var template =
      '<component>' +
      '<div>' +
      '<switch>' +
      '<case test={a > b}>' +
      '<attribute name="case" value="1" />' +
      '</case>' +
      '<case test={b > a}>' +
      '<attribute name="case" value="2" />' +
      '</case>' +
      '</switch>' +
      '</div>' +
      '</component>'
    var result = [
      {
        tag: 'div',
        attrs: {
          case: '2'
        },
        children: []
      }
    ]

    return parse(template, {a: 1, b: 2}).should.eventually.deep.equal(result)
  })

  it ('switch statement for attributes with positive default statement', function () {
    var template =
      '<component>' +
      '<div>' +
      '<switch>' +
      '<case test={a > b}>' +
      '<attribute name="case" value="1" />' +
      '</case>' +
      '<default>' +
      '<attribute name="case" value="default statement" />' +
      '</default>' +
      '</switch>' +
      '</div>' +
      '</component>'
    var result = [
      {
        tag: 'div',
        attrs: {
          case: 'default statement'
        },
        children: []
      }
    ]

    return parse(template, {a: 1, b: 2}).should.eventually.deep.equal(result)
  })

  it ('empty statements', function () {
    var template =
      '<component>' +
      '<div>' +
      '<switch>' +
      '<case test={a > b}>' +
      '</case>' +
      '<default>' +
      '</default>' +
      '</switch>' +
      '<variable name={emptyarr} value={[]} />' +
      '<if test={1}></if>' +
      '<for-each item={item} from={[]}></for-each>' +
      '</div>' +
      '</component>'
    var result = [
      {
        tag: 'div',
        attrs: {},
        children: []
      }
    ]

    return parse(template, {a: 1, b: 2}).should.eventually.deep.equal(result)
  })

  it ('if expression with attribute', function () {
    var template =
      '<component>' +
      '<span>' +
      '<if test={a == b}>' +
      '<attribute name="data-value" value="a is equal b" />' +
      '</if>' +
      '</span>' +
      '</component>'
    var params = {a: 5, b: 5}
    var result = [
      {
        tag: 'span',
        attrs: {
          'data-value': 'a is equal b'
        },
        children: []
      }
    ]

    return parse(template, params).should.eventually.deep.equal(result)
  })

  it ('array expressions open range grow up', function () {
    var template =
      '<component>' +
      '<for-each item={item} from={[5...end]}>' +
      '{ item }' +
      '</for-each>' +
      '</component>'
    var result = [
      5,
      6,
      7,
      8
    ]

    return parse(template, {end: 9}).should.eventually.deep.equal(result)
  })

  it ('if expression', function () {
    var template =
      '<component>' +
      '<switch>' +
      '<case test={a == b}>' +
      '<variable name={a} value={a + b} />' +
      '</case>' +
      '<case test={a > b && b < a}>' +
      '<variable name={a} value={a - b} />' +
      '</case>' +
      '<default>' +
      '<variable name={a} value={b} />' +
      '</default>' +
      '</switch>' +
      '{a}' +
      '</component>'
    var params = {a: 5, b: 10}

    return parse(template, params).should.eventually.deep.equal([10])
  })

  it ('if expression 2', function () {
    var template =
      '<component>' +
      '<switch>' +
      '<case test={a == b}>' +
      '<variable name={a} value={a + b} />' +
      '</case>' +
      '<case test={a > b && b < a}>' +
      '<variable name={a} value={a - b} />' +
      '</case>' +
      '<default>' +
      '<variable name={a} value={b} />' +
      '</default>' +
      '</switch>' +
      '{a}' +
      '</component>'
    var params = {a: 10, b: 5}

    return parse(template, params).should.eventually.deep.equal([5])
  })

  it ('array expressions open range grow down', function () {
    var template =
      '<component>' +
      '<for-each item={item} from={[start...5]}>' +
      '{ item }' +
      '</for-each>' +
      '</component>'
    var result = [
      9,
      8,
      7,
      6
    ]

    return parse(template, {start: 9}).should.eventually.deep.equal(result)
  })

  it ('array expressions closed range grow up', function () {
    var template =
      '<component>' +
      '<for-each item={item} from={[5..end]}>' +
      '{ item }' +
      '</for-each>' +
      '</component>'
    var result = [
      5,
      6,
      7,
      8,
      9
    ]

    return parse(template, {end: 9}).should.eventually.deep.equal(result)
  })

  it ('array expressions closed range grow down', function () {
    var template =
      '<component>' +
      '<for-each item={item} from={[start..5]}>' +
      '{ item }' +
      '</for-each>' +
      '</component>'
    var result = [
      9,
      8,
      7,
      6,
      5
    ]

    return parse(template, {start: 9}).should.eventually.deep.equal(result)
  })

  it ('doctype', function () {
    var template =
      '<component>' +
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >' +
      '<html lang="en">' +
      '<head>' +
      '<meta charset="UTF-8" />' +
      '<title>Document</title>' +
      '</head>' +
      '<body></body>' +
      '</html>' +
      '</component>'
    var result = [
      {
        tag: '!DOCTYPE',
        children: [],
        attrs: {
          'html': '',
          'PUBLIC': '',
          '"-//W3C//DTD XHTML 1.0 Transitional//EN"': '',
          '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"' : ''
        }
      },
      {
        tag: 'html',
        attrs: {
          'lang': 'en'
        },
        children: [
          {
            tag: 'head',
            attrs: {},
            children: [
              {
                tag: 'meta',
                attrs: {
                  'charset': 'UTF-8'
                },
                children: []
              },
              {
                tag: 'title',
                attrs: {},
                children: ['Document']
              }
            ]
          },
          {
            tag: 'body',
            attrs: {},
            children: []
          }
        ]
      }
    ]

    return parse(template).should.eventually.deep.equal(result)
  })

  it ('isset', function () {
    var template =
      '<component>' +
      '<switch>' +
      '<case test={!field[\'hide\']? || (field[\'hide\']? && !field[\'hide\'])}>hidden</case>' +
      '<default>show</default>' +
      '</switch>' +
      '</component>'

    return parse(template, {field: {}}).should.eventually.deep.equal(['hidden'])
  })

  it ('param with default value', function () {
    var template =
      '<component>' +
      '<param name={a} value={1} />' +
      '<switch>' +
      '<case test={a > b}>first</case>' +
      '<default>default</default>' +
      '</switch>' +
      '</component>'

    return parse(template, {b: 2}).should.eventually.deep.equal(['default'])
  })

  it ('param with rewritten value', function () {
    var template =
      '<component>' +
      '<param name={a} value={1} />' +
      '<switch>' +
      '<case test={a > b}>first</case>' +
      '<default>default</default>' +
      '</switch>' +
      '</component>'

    return parse(template, {a: 3, b: 2}).should.eventually.deep.equal(['first'])
  })

  it ('bits operations', function () {
    var template =
      '<component>' +
      '<variable name={flag1} value={1 << 0} />' +
      '<variable name={flag2} value={1 << 1} />' +
      '<variable name={flag3} value={1 << 2} />' +
      '<variable name={mix} value={flag1 | flag2} />' +
      '<if test={mix & flag1}>1</if>' +
      '<if test={mix & flag2}>2</if>' +
      '<if test={mix & flag3}>3</if>' +
      '<if test={mix | flag1}>4</if>' +
      '<if test={mix | flag2}>5</if>' +
      '<if test={mix | flag3}>6</if>' +
      '<variable name={mix} value={mix & ~flag1} />' +
      '<if test={mix & flag1}>7</if>' +
      '<variable name={mix} value={1 | 1 << 1 | 1 << 2 | 1 << 3} />' +
      '<if test={mix & flag3}>8</if>' +
      '<variable name={mix} value={mix & ~(1 << 2)} />' +
      '<if test={mix & flag3}>9</if>' +
      '{15 ^ 7}' +
      '</component>'
    var result = [
      '1',
      '2',
      '4',
      '5',
      '6',
      '8',
      8
    ]

    return parse(template).should.eventually.deep.equal(result)
  })

  it ('include with recursive parameters', function () {
    var tempCommentsName = generateName()
    var template =
      '<component>' +
      '<import name="user-comments" from="./' + tempCommentsName + '" />' +
      '<for-each item={comment} from={comments}>' +
      '<div>{ comment[\'name\'] }<div>' +
      '<user-comments comments={ comment.children } />' +
      '</div>' +
      '</div>' +
      '</for-each>' +
      '</component>'
    var data = {
      comments: [
        {
          name: 'Aleksei',
          children: [
            {
              name: 'Natasha',
              children: []
            }
          ]
        }
      ]
    }
    var result = [
      {
        tag: 'div',
        attrs: {},
        children: [
          'Aleksei',
          {
            tag: 'div',
            attrs: {},
            children: [
              {
                tag: 'div',
                attrs: {},
                children: [
                  'Natasha',
                  {
                    tag: 'div',
                    attrs: {},
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]

    return parseAndWriteFile(template, tempCommentsName + '.js')
      .then(function () {
        return runTemplate(tempCommentsName, data)
      })
      .should.eventually.deep.equal(result)
  })

  it ('include with common scope of template and children', function () {
    var tempWrapName = generateName()
    var tempAsideName = generateName()
    var tempName = generateName()
    var wrapTemplate =
      '<component>' +
      '<wrap title={ title }>{children}</wrap>' +
      '</component>'
    var asideTemplate =
      '<component>' +
      '<aside>{ children }<hr />' +
      '</aside>' +
      '</component>'
    var template =
      '<component>' +
      '<import name="wrap-component" from=\'./' + tempWrapName + '\' />' +
      '<import name="aside-component" from=\'./' + tempAsideName + '\' />' +
      '<variable name={variable} value={1} />' +
      '<wrap-component title="Title of Wrap!">' +
      '<aside-component>Text' +
      '<variable name={variable} value={variable + 1} />' +
      '</aside-component>' +
      '</wrap-component>' +
      '{variable}' +
      '</component>'
    var result = [
      {
        tag: 'wrap',
        attrs: {
          'title': 'Title of Wrap!'
        },
        children: [
          {
            tag: 'aside',
            attrs: {},
            children: [
              'Text',
              {
                tag: 'hr',
                attrs: {},
                children: []
              }
            ]
          }
        ]
      },
      2
    ]

    return Promise.all([
      parseAndWriteFile(wrapTemplate, tempWrapName + '.js'),
      parseAndWriteFile(asideTemplate, tempAsideName + '.js'),
      parseAndWriteFile(template, tempName + '.js')
    ])
      .then(function () {
        return runTemplate(tempName)
      })
      .should.eventually.deep.equal(result)
  })
})
