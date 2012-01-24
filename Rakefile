require 'net/http'

SOURCE = File.read('arctic.js')

task :default => 'arctic.min.js'

file 'arctic.min.js' => ['arctic.js'] do |t|
	puts "minyfy arctic.js"
	File.open(t.name, 'w') {|f|
		uri = URI.parse('http://closure-compiler.appspot.com/compile')
		req = Net::HTTP::Post.new(uri.request_uri)
		req.set_form_data({
			'js_code' => SOURCE,
			'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
			'output_format' => 'text',
			'output_info' => 'compiled_code'
		})
		f << Net::HTTP.start(uri.host, uri.port) {|http| http.request(req).body }
  	}
end
