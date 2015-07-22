var console = require('console')
var fs = require('fs')
var packager = require('electron-packager')
var path = require('path')

require('./build.js')

var root = path.dirname(__dirname)
var info = JSON.parse(fs.readFileSync(path.join(root, 'package.json')))
var today = new Date();

var app_name = info.name
var app_version = info.version
var app_id = 'com.noswap.apollo'
var app_icon = 'images/logobig.png'
var company = 'noswap.com'
var copyright = 'Copyright ' + today.getFullYear() + ' ' + info.author.name
var background = 'images/installer.png'

var create_asar = true
var ignore_list = [
  '.git',
  '.travis',
  'bin',
  'build',
  'makefile',
  'scripts',
  'tools',
]

var installers = {
  'darwin': function(build_path) {
    var appdmg = require('appdmg')
    console.log('Building dmg')

    var dmg = appdmg({
      'basepath': build_path,
      'target': app_name + '.dmg',
      'specification': {
        'title': app_name,
        'icon': path.join(root, app_icon),
        'background': path.join(root, background),
        'icon-size': 128,
        'contents': [
          {x: 100, y: 100, type: 'link', path: '/Applications'}
          {x: 300, y: 100, type: 'file', path: app_name + '.app'}
        ],
      }
    })

    dmg.on('error', function(error) {
      console.error('Building dmg failed: ' + error)
    })
  }
}

var build_list = [
  process.platform == 'win32' ? 'win32' : 'darwin',
  'linux',
]

build_list.forEach(function(platform, idx, all) {
  var binary = platform == 'darwin' ? app_name : app_name.toLowerCase()
  var arch = 'x64'
  var ignore = '(' + ignore_list.join('|') + ')'
  var build_root = path.join(root, 'build')

  var options = {
    'name': binary,
    'icon': path.join(root, app_icon),
    'app-version': app_version,
    'app-bundle-id': app_id,
    'helper-bundle-id': app_id + '.helper',
    'version-string': {
      'CompanyName': company,
      'LegalCopyright': copyright,
      'FileDescription': app_name,
      'OriginalFilename': binary + '.exe',
      'FileVersion': app_version,
      'ProductVersion': app_version,
      'ProductName': app_name,
      'InternalName': app_name,
    },
    'ignore': ignore,
    'dir': root,
    'out': build_root,
    'version': info.devDependencies['electron-prebuilt'],
    'platform': platform,
    'arch': arch,
    'asar': create_asar,
    'prune': true,
    'overwrite': true,
  }

  packager(options, function(error, app_path) {
    if (error) {
      console.error(error)
      return
    }

    if (installers[platform]) {
      var fn = installers[platform]
      fn(path.join(build_root, binary + '-' + platform + '-' + arch))
    }
  })
})
