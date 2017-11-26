var app = new Vue({
	el: '#app',
	data: {
		tInput: "",
		tUpdateInput: "",
		currentThoughtIndex: -1,
		thoughts: ["I'm cool", "I'm awesome", "Pure awesomeness never die"]
	},
	methods: {
		addThought(){
			if (!this.tInput) {
				return
			}
			this.thoughts.unshift(this.tInput)
			this.tInput = ""
			this.$refs.input_thought.focus()
		},
		addThoughtEnter(e) {
			if (e.code === "Enter") {
				this.addThought()
			}
		},
		showConfirmationModal(index) {
			$('#modal_confirm').modal('show')
			this.currentThoughtIndex = index
		},
		showEditModal() {
			this.tUpdateInput = this.thoughts[this.currentThoughtIndex]
			$('#modal_confirm').modal('hide')
			$('#modal_edit').modal('show')
		},
		updateThought(){
			$('#modal_edit').modal('hide')
			this.thoughts[this.currentThoughtIndex] = this.tUpdateInput
			this.tUpdateInput = ""
		},
		removeThought(){
			$('#modal_confirm').modal('hide')
			this.thoughts.splice(this.currentThoughtIndex, 1)
		}
	}
})