var app = new Vue({
    el: '#app',
    data: {
        currentVideoTitle: '',
        videos: [
            {id: "4KzBLpQ1LmU", title: "Yufid Kids - Doa Berbuka Puasa", by: "Yufid.TV"}, 
            {id: "ZTPNzYKRvmw", title: "Yufid Kids - Doa Bangun Tidur", by: "Yufid.TV"},
            {id: "ywpHWx-l500", title: "Yufid Kids - Mengenal Angka: 1 - 5", by: "Yufid.TV"}, 
            {id: "w-OFnyJbSRw", title: "Yufid Kids - Mengenal Angka: 6 - 10", by: "Yufid.TV"}, 
            {id: "okQggW16h44", title: "Bincang Ringan Angkringan - Pilih Kiri atau Kanan?", by: "Yufid.TV"}, 
            {id: "knZ9Tj3vAo0", title: "Bincang Ringan Angkringan - Dzikir Saat Jalan Naik & Turun", by: "Yufid.TV"},
            {id: "PeBPkYEXVJk", title: "Bincang Ringan Angkringan - Takut Setan?", by: "Yufid.TV"},
            {id: "AQF_MBQCrNs", title: "Saudaraku - Maen PS, Apa Bisa Jadi Haram?", by: "Yufid.TV"},
            {id: "0W1WJFZ5SsU", title: `Saudaraku - Budaya "Ngepek"`, by: "Yufid.TV"},
        ],
        contentAboutUs: `
            <p>Assalamu'alaykum, Abi & Ummi!</p>
            
            <p><span class="font-weight-bold">FatihKids.TV</span> adalah layanan rekomendasi tontonan gratis yang dimaksudkan untuk membantu Abi & Ummi dalam memilihkan tontonan yang baik lagi bermanfaat bagi si buah hati.</p>

            <p>Seperti yang telah kita sadari bahwa saat ini banyak sekali tontonan-tontonan di luar sana yang tidak bermanfaat bahkan seringkali "merusak" pemikiran anak-anak kita sebagai seorang muslim.</p>

            <p>Sayangnya saat ini sangat sedikit sekali tontonan-tontonan yang bermanfaat namun menarik bagi anak-anak muslim. Oleh karena itu <span class="font-weight-bold">FatihKids.TV</span> hadir untuk membantu Abi & Ummi dalam menyediakan tontonan berkualitas lagi menarik bagi si buah hati.</p>

            <p>Namun video-video yang terdapat dalam layanan ini bukanlah milik kami. Kami hanyalah mengumpulkan tautan-tautannya saja lalu menayangkannya pada layanan kami.</p>

            <p>Apabila Abi & Ummi ingin memberikan masukan baik itu berupa kritik, saran, maupun rekomendasi konten, Abi & Ummi dapat mengirim email kepada kami di <span class="font-weight-bold">fatihkidstv@gmail.com</span>.</p>

            <p>Terimakasih banyak sudah mengunjungi layanan kami, Abi & Ummi. Semoga layanan kami dapat memberikan manfaat bagi Abi & Ummi serta si buah hati.</p>

            <br/>
            <p class="text-right">Hormat kami,<br/>Tim Developer FatihKids.TV</p>
        `
    },
    methods: {
        setVideoIFrame(videoId, title){
            // it is necessary to replace iframe instead of just replace its
            // src property, otherwise when src is changed it will add entry
            // to window history.
            // 
            // I think vue is not good choice for this idea because it doesn't
            // meant for having dynamic html insert & replace, thus I use jquery
            // to replace iframe which is simpler.
            var url = ''
            if (videoId) { 
                url = `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&showinfo=0`
            }
            this.currentVideoTitle = title
            iframeTemplate = `<iframe id="iframe_video" class="embed-responsive-item" src="${url}" allowfullscreen></iframe>`
            $('#iframe_video').replaceWith(iframeTemplate)
        },
        getThumbnailURL(videoId){
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        },
        playVideo(idx){
            currentVideo = this.videos[idx]
            this.setVideoIFrame(currentVideo.id, currentVideo.title)
            $('#modal_video_player').modal('show')
        },
        showAboutUs(){
            $('#modal_about_us').modal('show')
        }
    },
})

// register event for stopping playing video once modal closed
// the idea to stop the video is to replace current IFrame into empty one
// the reason why we can't just replace the src attribute in IFrame is because 
// of default behavior of src changed which will add entry to window history
// which in our case is not good
$('#modal_video_player').on('hide.bs.modal', function(){
   app.setVideoIFrame('','')
})

// close navbar nav when modal is shown
$('.modal').on('shown.bs.modal', function(){
    $('#navbarsExampleDefault').removeClass('show')
})