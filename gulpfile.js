
var gulp = require('gulp');
var cheerio = require('gulp-cheerio');
var file = require('gulp-file');
var jsonEditor = require('gulp-json-editor');
var path = require('path');

var paths = {
  sampleAssertionPaths: [
    'site-reactelement/assertions/ReactElement/index.html',
    'site-renderedreactelement/assertions/RenderedReactElement/index.html',
    'site-testrenderer/assertions/ReactTestRenderer/index.html'
  ],
  allAssertions: [
    'site-reactelement/assertions/ReactElement/**/*.html',
    'site-renderedreactelement/assertions/RenderedReactElement/**/*.html',
    'site-testrenderer/assertions/ReactTestRenderer/**/*.html'
  ],
  otherDocs: [
    'site-reactelement/**/*',
    '!site-reactelement/assertions/**/*.html'
  ],
  searchIndex: [
    'site-reactelement/searchIndex.json',
    'site-renderedreactelement/searchIndex.json',
    'site-testrenderer/searchIndex.json'
  ],
  output: 'site-build'
};

var navs = {};
var fullNavigation = '';

gulp.task('extract-navs', function () {
  return gulp.src(paths.sampleAssertionPaths)
    .pipe(cheerio(function ($, file) {
      $('#assertion-menu li.active').attr('class', '');
      $('#assertion-menu h3.active').attr('class', '');
  
      var assertionSubjectPath = path.basename(path.dirname(file.path));
  
      $('#assertion-menu h3 a').each(function () {
  
        var anchor = $(this);
        anchor.attr('href', path.join('../..', assertionSubjectPath));
      });
  
      $('#assertion-menu li a').each(function () {
        var anchor = $(this);
        anchor.attr('href', path.join('../..', assertionSubjectPath, path.basename(anchor.attr('href'))));
      });
      
      navs[file.path.substr(file.cwd.length + 1).split('/')[0]] = $('#assertion-menu').html();
    }));
});

gulp.task('merge-navs', ['extract-navs'], function (callback) {
  fullNavigation = navs['site-reactelement'] + navs['site-renderedreactelement'] + navs['site-testrenderer'];
  callback();
});

gulp.task('update-all-navs', ['merge-navs'], function () {
  
  return gulp.src(paths.allAssertions)
    .pipe(cheerio(function ($, file) {
      $('#assertion-menu').html(fullNavigation);
  
      var assertionSubjectPath = path.basename(path.dirname(path.dirname(file.path)));
      var subjectPrefix;
      if (assertionSubjectPath === 'assertions') {
        // This is the index.html at the root of the subject directory (e.g. ReactElement/index.html)
        // Need to remove one '../' from each link
        // Update the assertionSubjectPath so it's correct for the 'active' class update just below
        assertionSubjectPath = path.basename(path.dirname(file.path));
        $('#assertion-menu li a').each(function () {
          var anchor = $(this);
          anchor.attr('href', anchor.attr('href').substr(3));
        });
  
        // Update the links for the groups
        $('#assertion-menu h3 a').each(function () {
          var anchor = $(this);
          anchor.attr('href', anchor.attr('href').substr(3));
        });
        subjectPrefix = '../';
      } else {
        // This is a normal assertion page, need to remove the href from the active <a> element, 
        // and set the 'active' class on the parent li
        var assertionName = path.basename(path.dirname(file.path));
        var currentAssertion = $('#assertion-menu').find('li a[href="../../' + assertionSubjectPath + '/' + assertionName + '"]');
        currentAssertion.attr('href', '');
        currentAssertion.parent().attr('class', 'active');
        subjectPrefix = '../../';
      }
      
      // Update the assertion subject group to be 'active'
      $('#assertion-menu').find('h3 a').each(function () {
        var anchor = $(this);
        if (anchor.text() === assertionSubjectPath) {
          anchor.parent().attr('class', 'active');
          anchor.attr('href', '');
        } 
      });
      
  
      file.base = path.join(file.cwd, file.path.substr(file.cwd.length + 1).split('/')[0]);
    }))
    .pipe(gulp.dest(paths.output));
});

gulp.task('copy-rest', function () {
  return gulp.src(paths.otherDocs)
    .pipe(gulp.dest(paths.output));
});

var mergedSearch = [];
gulp.task('merge-search', function () {

  return gulp.src(paths.searchIndex)
    .pipe(jsonEditor(function (json) {
      mergedSearch = mergedSearch.concat(json);
      return json;
    }))
    .pipe(gulp.dest(paths.output)); // jsonEditor seems to have issues if we don't pipe the output to a writer
    // This output will be overwritten when we 'output-search' completes
});

gulp.task('output-search', ['merge-search'], function () {
  return file('searchIndex.json', JSON.stringify(mergedSearch, null, 2), { src: true })
    .pipe(gulp.dest(paths.output));
});

gulp.task('default', ['update-all-navs', 'copy-rest', 'output-search']);

