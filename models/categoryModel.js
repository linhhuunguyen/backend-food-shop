import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter category name"],
      trim: true,
    },
    slug: { type: String, index: true },
    parent:{
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Category"
    },
    ancestors:[{
      _id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true
      },
      name: String,
      slug: String
    }],
    description: {
      type: String,
      required: [true, "Please enter category description"],
      trim: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

function slugify(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

categorySchema.pre('save', async function(next){
  this.slug = slugify(this.name)
})

const Category = mongoose.model("Category", categorySchema);

export default Category;
