

let project_folder = 'dist'
let source_folder = '#src'

let path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        img: project_folder + '/img/'
    },
    src: {
        html: [source_folder + '/*.html', '!'+source_folder + '/_*.html'],
        css: source_folder + '/scss/*.scss',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}'
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}'
    },
    clean: './' + project_folder + '/'
}
let {src, dest} = require('gulp'),
gulp = require('gulp'),
fileinclude = require('gulp-file-include'),
browsersync = require('browser-sync').create(),
del = require('del'),
scss = require('gulp-sass')(require('sass')),
autoprefixer = require('gulp-autoprefixer'),
group_media = require('gulp-group-css-media-queries'),
clean_css = require('gulp-clean-css'),
rename = require('gulp-rename'),

imagemin = require('gulp-imagemin'),
webp = require('gulp-webp'),
webphtml = require('gulp-webp-html'),
webpcss = require('gulp-webpcss')


function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
    .pipe(
        scss({
            outputStyle: 'expanded'
        })
    )
    .pipe(
        autoprefixer({
            browsers: ['last 5 versions'],
            cascade: true
        })
    )
    .pipe(
        group_media()
    )
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
        rename({
            extname: '.min.css'
        })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
    .pipe(
        webp({
            quality: 70
        })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
        imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox : false}],
            interlaced: true,
            optimizationLevel: 3
        })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}




function watchFiles() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css),
    gulp.watch([path.watch.img], images)
}

function clean() {
    return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(css, html, images))
let watch = gulp.parallel(build, watchFiles, browserSync)

exports.images = images
exports.css = css
exports.html = html
exports.build = build
exports.watch = watch
exports.default = watch