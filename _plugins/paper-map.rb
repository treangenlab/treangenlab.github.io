# Builds site.data["paper_map"] from _bibliography/papers.bib for the scatter plot on the papers page.
# Each paper needs app_score and algo_score fields (0 to 10) in its BibTeX entry; papers without them are left out.
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
        next unless entry.respond_to?(:key) && entry.field?(:app_score) && entry.field?(:algo_score)

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
          "app" => entry[:app_score].to_s.to_f,
          "algo" => entry[:algo_score].to_s.to_f,
          "url" => url
        }
      end
      site.data["paper_map"] = papers
    end
  end
end
