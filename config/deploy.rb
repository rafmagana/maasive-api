# # Deploy
# Capistrano deployment configuration file

set :stages, %w(production staging)
set :default_stage, "staging"
require 'capistrano/ext/multistage'

set :application, "MaaSiveApi"

set :user, 'your_user'
set :group, 'your_group'

set :use_sudo, false

set :scm, :git
set :repository, "git@github-api:elc/maasive-api.git"

set :deploy_env, "staging"
set :app_parent_path, "your_parent_path"
set :app_dir_name, "#{deploy_env}.#{application}"
set :deploy_to, "#{app_parent_path}/#{app_dir_name}"
set :deploy_via,  :remote_cache

default_run_options[:pty] = true

before "deploy:restart", "custom:load_profile"
before "deploy:start", "npm:install"
before "deploy:symlink", "custom:symlink"
before "deploy:symlink", "custom:set_node_env"

after "deploy:setup", "custom:forever"

namespace :npm do
  desc "Updating modules with NPM"
  task :install, :roles => :app, :except => { :no_release => true } do
    run "cd #{current_path} && npm install"
  end
end

namespace :custom do

  task :forever do
    run "npm install forever"
  end

  task :symlink, :roles => :app do
    run <<-CMD
      ln -nfs #{shared_path}/pids #{release_path}/pids
    CMD
  end

  task :set_node_env, :roles => :app do
    run "export NODE_ENV=#{stage}"
  end

  task :load_profile, :roles => :app do
    run "source ~/.bash_profile"
  end

end

namespace :tail do

  task :logs, :roles => :app do
    run "cd #{shared_path}/log/ && tail -n200 -f `ls -tr | grep log | tail -n 1`"
  end
  
  task :unicorn_err, :roles => :app do
    run "tail -f #{shared_path}/log/unicorn.stderr.log"
  end
  
  task :unicorn_out, :roles => :app do
    run "tail -f #{shared_path}/log/unicorn.stdout.log"
  end

  task :mongos, :roles => :app do
    run "tail -f /var/log/mongodb/mongos.log"
  end

end

namespace :deploy do

  desc "Starting the Node.js process"
  task :start, :roles => :app do
    run "cd #{current_path} && NODE_ENV=#{stage} /usr/lib/node_modules/forever/bin/forever start --sourceDir #{current_path} -l #{current_path}/log/#{stage}-#{release_name}.log server.js"
  end
  
  desc "Reload the Node.js process"
  task :reload, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} kill -s USR2 `cat #{shared_path}/pids/master.pid`"
  end

  desc "Stopping the app Node.js process"
  task :stop, :roles => :app do
    run "cd #{current_path} && NODE_ENV=#{stage} /usr/lib/node_modules/forever/bin/forever stop server.js"
  end
  
  desc "Restarting the Node.js process"
  task :restart, :roles => :app, :except => { :no_release => true } do
    stop
    start
  end

  desc "This is not a Rails project so we don't need to run migrations"
	task :cold do
		update
		start
	end

end
