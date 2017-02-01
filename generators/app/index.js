var path = require('path');
var slugify = require('slugify');
var mkdirp = require('mkdirp');

var Generator = require('yeoman-generator');


module.exports = Generator.extend({

  constructor: function () {
    Generator.apply(this, arguments);
    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('skip-install', {
      desc: 'Skips installing dependencies',
      type: Boolean
    });
  },

  initializing: function () {
    this.pkg = require('../../package.json');
  },

  prompting: {
    meta: function() {
      var done = this.async();
      this.prompt([{
          type    : 'input',
          name    : 'name',
          message : 'Project Name:',
          default : this.appname      // Default to current folder name
      },{
        type    : 'input',
        name    : 'slug',
        message : 'Project Slug:',
        default : slugify(this.appname)      // Default to current folder name
      },{
        type    : 'input',
        name    : 's3bucket',
        message : 'Project S3 Bucket:',
        default : 'graphics.axios.com'      // Default to current folder name
      },{
        type    : 'input',
        name    : 's3folder',
        message : 'Project S3 Folder:',
        default : slugify(this.appname)      // Default to current folder name
      }]).then(function(answers, err) {
        this.meta = {};
        this.meta.name = answers.name;
        this.meta.slug = answers.slug;
        this.meta.s3bucket = answers.s3bucket;
        this.meta.s3folder = answers.s3folder;
        done(err);
      }.bind(this));
    }
  },

  configuring: {
    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath('_gulpfile.js'),
        this.destinationPath('gulpfile.js'), {}
      );
    },
    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        { meta: this.meta }
      );
    },
    projectConfig: function () {
      this.fs.copyTpl(
        this.templatePath('_project.config.js'),
        this.destinationPath('project.config.js'),
        { meta: this.meta }
      );
    },
    git: function () {
      this.fs.copy(
        this.templatePath('_gitignore'),
        this.destinationPath('.gitignore'));
    },
    readme: function () {
      this.fs.copy(
        this.templatePath('_README.md'),
        this.destinationPath('README.md'));
    },
    gulp: function() {
      this.fs.copy(
        this.templatePath('gulp'),
        this.destinationPath('gulp')
      );
    }
  },

  writing: {
    misc: function () {
      mkdirp('data');
      mkdirp('src/img');
      mkdirp('src/templates/partials');
      mkdirp('src/sass');
      mkdirp('src/js');
      this.fs.write(this.destinationPath('data/.gitkeep'), '');
      this.fs.write(this.destinationPath('src/img/.gitkeep'), '');
      this.fs.write(this.destinationPath('src/templates/partials/.gitkeep'), '');

    },
    sass: function() {
      this.fs.copyTpl(
        this.templatePath('src/_main.scss'),
        this.destinationPath('src/sass/main.scss')
      );
    },
    handlebars: function() {
      this.fs.copyTpl(
        this.templatePath('src/_index.hbs'),
        this.destinationPath('src/templates/index.hbs'),
        { meta: this.meta }
      );
      this.fs.copyTpl(
        this.templatePath('src/_base.hbs'),
        this.destinationPath('src/templates/layouts/base.hbs'),
        { meta: this.meta }
      );
    },
    js: function() {
      this.fs.copyTpl(
        this.templatePath('src/_app.js'),
        this.destinationPath('src/js/app.js'),
        { meta: this.meta }
      );
    }

  },

  install: function () {
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },

});