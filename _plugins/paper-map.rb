# Builds site.data["paper_map"] from _bibliography/papers.bib for the scatter plot on the papers page.
# Each paper needs comp_axis and bio_axis fields (-10 to 10) in its BibTeX entry; papers without them are left out.
# comp_axis: statistics and machine learning terms (positive) versus sequence algorithm and data structure terms (negative).
# bio_axis: microbiome terms (positive) versus pathogen and microbial genomics terms (negative).
# paper_type (preprint, paper or review) sets the shape of the mark; it defaults to paper.
# Entries with papers_page = {false} (papers by lab members without the PI as an author) are left off the plot
# and the papers page; they still appear on the member's profile.
# Both positions come from how densely each kind of term appears in the title, abstract and, where openly available, full text.
require "bibtex"

module Jekyll
  class PaperMapGenerator < Generator
    safe true
    priority :high

    def generate(site)
      path = File.join(site.source, "_bibliography", "papers.bib")
      return unless File.exist?(path)

      clean = ->(value) { value.to_s.gsub(/[{}]/, "").gsub(/\\&/, "&").strip }
      papers = []
      BibTeX.open(path, filter: :latex).each do |entry|
        next unless entry.respond_to?(:key) && entry.field?(:comp_axis) && entry.field?(:bio_axis)
        next if entry.field?(:papers_page) && entry[:papers_page].to_s.strip == "false"

        url = nil
        if entry.field?(:html) && entry[:html].to_s.include?("://")
          url = entry[:html].to_s
        elsif entry.field?(:doi)
          url = "https://doi.org/" + entry[:doi].to_s
        end
        papers << {
          "key" => entry.key.to_s,
          "title" => clean.call(entry[:title]),
          "year" => entry[:year].to_s,
          "venue" => clean.call(entry.field?(:journal) ? entry[:journal] : entry[:booktitle]),
          "theme" => entry.field?(:theme) ? clean.call(entry[:theme]) : "",
          "x" => entry[:comp_axis].to_s.to_f,
          "y" => entry[:bio_axis].to_s.to_f,
          "kind" => entry.field?(:paper_type) ? clean.call(entry[:paper_type]) : "paper",
          "url" => url
        }
      end
      site.data["paper_map"] = papers
    end
  end
end
